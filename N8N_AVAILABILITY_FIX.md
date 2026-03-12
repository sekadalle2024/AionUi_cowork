# n8n Agent Availability Fix

## Problem
When selecting the n8n agent in the Guid page, the system showed the error message:
```
n8n is not available, switched to gemini
```

The message was then routed to Gemini instead of n8n, even though the n8n backend was running correctly on port 3458.

Additionally, when trying to create an n8n conversation, the database rejected it with:
```
CHECK constraint failed: type IN ('gemini', 'acp', 'codex', 'openclaw-gateway', 'nanobot')
```

## Root Causes

### 1. Agent Availability Check
The `isMainAgentAvailable()` function in `useGuidAgentSelection.ts` only checked for agents in the `availableAgents` array (which comes from ACP protocol detection). Since n8n is a standalone microservice that doesn't use the ACP protocol, it was never detected as available.

### 2. Database Schema Constraint
The database schema didn't include 'n8n' as a valid conversation type in the CHECK constraint, preventing n8n conversations from being created.

## Solution

### 1. Added n8n availability check
**File**: `src/renderer/pages/guid/hooks/useGuidAgentSelection.ts`

Added special handling for n8n in the `isMainAgentAvailable` callback:
```typescript
const isMainAgentAvailable = useCallback(
  (agentType: string): boolean => {
    if (agentType === 'gemini') {
      return isGoogleAuth || (modelList != null && modelList.length > 0);
    }
    // n8n is always considered available (health check happens at conversation creation)
    if (agentType === 'n8n') {
      return true;
    }
    return availableAgents?.some((agent) => agent.backend === agentType) ?? false;
  },
  [modelList, availableAgents, isGoogleAuth]
);
```

### 2. Added n8n conversation creation
**File**: `src/renderer/pages/guid/hooks/useGuidSend.ts`

Added n8n conversation creation path before the ACP path:
```typescript
// n8n path
if (selectedAgent === 'n8n' || (isPreset && finalEffectiveAgentType === 'n8n')) {
  try {
    const conversation = await ipcBridge.conversation.create.invoke({
      type: 'n8n',
      name: input,
      model: currentModel!,
      extra: {
        defaultFiles: files,
        workspace: finalWorkspace,
        customWorkspace: isCustomWorkspace,
        enabledSkills: isPreset ? enabledSkills : undefined,
        presetAssistantId: isPreset ? agentInfo?.customAgentId : undefined,
      },
    });
    // ... handle conversation creation
  }
}
```

### 3. Added createN8nAgent function
**File**: `src/process/initAgent.ts`

Created the n8n agent initialization function:
```typescript
export const createN8nAgent = async (options: ICreateConversationParams): Promise<TChatConversation> => {
  const { extra } = options;
  const { workspace, customWorkspace } = await buildWorkspaceWidthFiles(
    `n8n-temp-${Date.now()}`,
    extra.workspace,
    extra.defaultFiles,
    extra.customWorkspace
  );
  return {
    type: 'n8n',
    extra: {
      workspace: workspace,
      customWorkspace,
      enabledSkills: extra.enabledSkills,
      presetAssistantId: extra.presetAssistantId,
    },
    createTime: Date.now(),
    modifyTime: Date.now(),
    name: workspace,
    id: uuid(),
  };
};
```

### 4. Updated conversation service
**File**: `src/process/services/conversationService.ts`

- Added import for `createN8nAgent`
- Added n8n case in `createConversation` method:
```typescript
} else if (type === 'n8n') {
  conversation = await createN8nAgent(params);
} else {
```

### 5. Updated database schema
**File**: `src/process/database/schema.ts`

Added 'n8n' to the conversation type CHECK constraint:
```typescript
type TEXT NOT NULL CHECK(type IN ('gemini', 'acp', 'codex', 'openclaw-gateway', 'nanobot', 'n8n')),
```

### 6. Created database migration
**File**: `src/process/database/migrations.ts`

Added migration v16 to update existing databases:
```typescript
const migration_v16: IMigration = {
  version: 16,
  name: 'Add n8n to conversations type constraint',
  up: (db) => {
    // Recreate conversations table with n8n type
    // ... migration code
  },
  down: (db) => {
    // Rollback: Remove n8n conversations
    // ... rollback code
  },
};
```

### 7. Fixed lint error
**File**: `src/process/bridge/n8nConversationBridge.ts`

Removed unused `ipcBridge` import that was causing a lint warning.

## Architecture Flow

```
User selects n8n agent in Guid
    ↓
isMainAgentAvailable('n8n') → returns true
    ↓
User sends message
    ↓
useGuidSend detects n8n agent
    ↓
Creates n8n conversation via IPC
    ↓
conversationService.createConversation (type: 'n8n')
    ↓
createN8nAgent() creates conversation object
    ↓
Database migration v16 allows 'n8n' type
    ↓
Conversation saved to database
    ↓
WorkerManage.buildConversation() registers it
    ↓
N8nAgentManager handles message execution
    ↓
n8nService.executeN8nWorkflow() → HTTP POST to localhost:3458
    ↓
n8n backend processes workflow
    ↓
Response returned to user
```

## Testing

1. Start the n8n backend:
   ```bash
   npx ts-node --transpile-only src/agent/n8n/n8n-server.ts
   ```

2. Start the Electron app:
   ```bash
   npm run start
   ```

3. Or use the unified script:
   ```bash
   npm run start:all
   ```

4. In the Guid page:
   - Click the n8n button or select "n8n Workflow" preset
   - Enter a message like: `[Command] = Programme de travail [Processus] = inventaire de caisse`
   - The message should be sent to n8n without the "not available" error
   - The conversation should be created successfully in the database
   - n8n should process the workflow and return a response

## Files Modified

1. `src/renderer/pages/guid/hooks/useGuidAgentSelection.ts` - Added n8n availability check
2. `src/renderer/pages/guid/hooks/useGuidSend.ts` - Added n8n conversation creation
3. `src/process/initAgent.ts` - Added createN8nAgent function
4. `src/process/services/conversationService.ts` - Added n8n case handling
5. `src/process/database/schema.ts` - Added 'n8n' to type constraint
6. `src/process/database/migrations.ts` - Added migration v16
7. `src/process/bridge/n8nConversationBridge.ts` - Removed unused import

## Database Migration

The migration will run automatically when the app starts. It will:
- Recreate the conversations table with 'n8n' added to the type constraint
- Preserve all existing conversation data
- Add necessary indexes

If you need to rollback, the migration includes a down() function that:
- Deletes all n8n conversations
- Recreates the table without 'n8n' type

## Notes

- n8n is always considered "available" because it's a microservice that should be started independently
- Health checks happen at conversation creation time, not at availability check time
- The n8n backend must be running on port 3458 for messages to be processed
- If the backend is not running, the user will see an error when trying to send a message, not during agent selection
- The database migration runs automatically on app startup
