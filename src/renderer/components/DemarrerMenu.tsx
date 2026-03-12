/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DemarrerMenu Component - E-audit Start Menu
 * 
 * Hierarchical context menu for automating E-audit prompts
 * Design inspired by Claude/ChatGPT menu with side-by-side panels
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Play } from '@icon-park/react';
import { useTranslation } from 'react-i18next';

// ============================================================
// TYPES
// ============================================================

type ModeItem = {
  id: string;
  label: string;
  prefix?: string;
  command?: string;
};

type EtapeItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  command?: string;
  modes?: ModeItem[];
  norme?: string;
};

type TestItem = {
  id: string;
  reference: string;
  label: string;
  processus: string;
  command: string;
};

type CycleComptable = {
  id: string;
  label: string;
  icon: React.ReactNode;
  tests: TestItem[];
};

type PhaseItem = {
  id: string;
  label: string;
  etapes?: EtapeItem[];
  cycles?: CycleComptable[];
};

type LogicielItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  phases: PhaseItem[];
};

type DemarrerMenuProps = {
  onInsertCommand: (command: string) => void;
  disabled?: boolean;
};

// ============================================================
// MODES DISPONIBLES
// ============================================================

const MODES: ModeItem[] = [
  { id: 'normal', label: 'Normal', prefix: '' },
  { id: 'demo', label: 'Demo', prefix: '[Demo] = Activate\n' },
  { id: 'avance', label: 'Avancé', prefix: '[Mode] = Avancé\n' },
  { id: 'manuel', label: 'Manuel', prefix: '[Mode] = Manuel\n' },
];

// ============================================================
// MENU DATA - Simplified version
// ============================================================

const MENU_DATA: LogicielItem[] = [
  {
    id: 'e-audit-pro',
    label: 'E-audit pro',
    icon: <span className="i-carbon-briefcase w-4 h-4" />,
    phases: [
      {
        id: 'phase-preparation',
        label: 'Phase de préparation',
        etapes: [
          {
            id: 'programme-travail',
            label: 'Programme de travail',
            icon: <span className="i-carbon-document w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Programme de travail
[Processus] = inventaire de caisse
[Nb de lignes] = 25`,
              },
            ],
          },
        ],
      },
    ],
  },
];

// ============================================================
// SUB-MENU PORTAL COMPONENT
// ============================================================

type SubMenuPortalProps = {
  etape: EtapeItem;
  anchorRect: DOMRect;
  onModeClick: (mode: ModeItem) => void;
  onClose: () => void;
};

const SubMenuPortal: React.FC<SubMenuPortalProps> = ({ etape, anchorRect, onModeClick, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.top,
    left: anchorRect.right + 4,
    zIndex: 9999,
  };

  if (anchorRect.right + 200 > window.innerWidth) {
    style.left = anchorRect.left - 200 - 4;
  }

  return ReactDOM.createPortal(
    <div ref={menuRef} data-submenu-portal style={style} className="min-w-220px max-w-320px bg-dialog-fill-0 rd-8px shadow-2xl b-1 b-solid b-border-2 py-1">
      <div className="px-3 py-2 b-b-1 b-solid b-border-2">
        <div className="text-xs font-semibold text-primary">{etape.label}</div>
        {etape.norme && <div className="text-10px text-t-secondary mt-1 lh-tight">Norme {etape.norme}</div>}
      </div>
      {(etape.modes || MODES).map((mode) => (
        <button
          key={mode.id}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-t-primary hover:bg-fill-2 transition-colors"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onModeClick(mode);
          }}
        >
          <span className="i-carbon-user w-4 h-4 text-t-secondary" />
          <span>{mode.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DemarrerMenu: React.FC<DemarrerMenuProps> = ({ onInsertCommand, disabled = false }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLogiciel, setActiveLogiciel] = useState<string | null>(null);
  const [activeEtape, setActiveEtape] = useState<EtapeItem | null>(null);
  const [etapeAnchorRect, setEtapeAnchorRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-submenu-portal]')) {
          closeMenu();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveLogiciel(null);
    setActiveEtape(null);
    setEtapeAnchorRect(null);
  };

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
    }
  }, [isOpen]);

  const handleEtapeClick = (etape: EtapeItem, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (activeEtape?.id === etape.id) {
      setActiveEtape(null);
      setEtapeAnchorRect(null);
    } else {
      setActiveEtape(etape);
      setEtapeAnchorRect(rect);
    }
  };

  const formatCommandWithBullets = (command: string): string => {
    const lines = command.split('\n');
    const formattedLines = lines.map((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('[') && !trimmedLine.startsWith('- [')) {
        return `- ${trimmedLine}`;
      }
      if (trimmedLine === '') {
        return line;
      }
      return line;
    });
    return formattedLines.join('\n');
  };

  const handleModeClick = (mode: ModeItem) => {
    if (activeEtape) {
      const rawCommand = mode.command || (mode.prefix && activeEtape.command ? mode.prefix + activeEtape.command : activeEtape.command || '');
      const finalCommand = formatCommandWithBullets(rawCommand);

      try {
        onInsertCommand(finalCommand);
      } catch (error) {
        console.error('[DemarrerMenu] Error calling onInsertCommand:', error);
      }

      setTimeout(() => {
        closeMenu();
      }, 100);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 rd-full text-sm font-medium transition-all ${
          isOpen ? 'bg-primary text-white shadow-lg' : 'bg-fill-2 text-t-primary hover:bg-fill-3'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={t('demarrer.menu.title', { defaultValue: 'Menu Démarrer E-audit' })}
      >
        <Play theme="filled" size="16" />
        <span>{t('demarrer.menu.button', { defaultValue: 'Démarrer' })}</span>
      </button>

      {isOpen && (
        <div ref={menuRef} data-demarrer-menu className="absolute bottom-full mb-2 left-0 min-w-280px bg-dialog-fill-0 rd-12px shadow-2xl b-1 b-solid b-border-2 overflow-hidden z-50" style={{ maxHeight: '70vh' }}>
          <div className="flex items-center justify-between px-4 py-3 b-b-1 b-solid b-border-2 bg-primary">
            <div className="flex items-center gap-2 text-white">
              <Play theme="filled" size="20" />
              <span className="font-semibold">{t('demarrer.menu.header', { defaultValue: 'Menu Démarrer' })}</span>
            </div>
            <button onClick={closeMenu} className="p-1 rd-full hover:bg-white/20 transition-colors text-white">
              <span className="i-carbon-close w-4 h-4" />
            </button>
          </div>
          <div className="py-1 max-h-60vh overflow-y-auto">
            {MENU_DATA.map((logiciel) => (
              <div key={logiciel.id}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors b-b-1 b-solid b-border-2 ${
                    activeLogiciel === logiciel.id ? 'bg-fill-2 text-primary' : 'text-t-primary hover:bg-fill-1'
                  }`}
                  onClick={() => {
                    setActiveLogiciel(activeLogiciel === logiciel.id ? null : logiciel.id);
                    setActiveEtape(null);
                    setEtapeAnchorRect(null);
                  }}
                >
                  <span className="flex-shrink-0">{logiciel.icon}</span>
                  <span className="flex-1">{logiciel.label}</span>
                  <span className={`i-carbon-chevron-right w-4 h-4 transition-transform ${activeLogiciel === logiciel.id ? 'rotate-90' : ''}`} />
                </button>

                {activeLogiciel === logiciel.id && (
                  <div className="bg-fill-1">
                    {logiciel.phases.map((phase) => (
                      <div key={phase.id}>
                        <div className="px-4 py-2 text-xs font-semibold text-t-secondary uppercase tracking-wider bg-fill-2">{phase.label}</div>

                        {phase.etapes &&
                          phase.etapes.map((etape) => (
                            <button
                              key={etape.id}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 pl-6 text-left text-sm transition-colors ${
                                activeEtape?.id === etape.id ? 'bg-fill-2 text-primary' : 'text-t-primary hover:bg-fill-2'
                              }`}
                              onClick={(e) => handleEtapeClick(etape, e)}
                            >
                              <span className="flex-shrink-0">{etape.icon}</span>
                              <span className="flex-1">{etape.label}</span>
                              <span className="i-carbon-chevron-right w-4 h-4" />
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeEtape && etapeAnchorRect && <SubMenuPortal etape={activeEtape} anchorRect={etapeAnchorRect} onModeClick={handleModeClick} onClose={() => {
        setActiveEtape(null);
        setEtapeAnchorRect(null);
      }} />}
    </div>
  );
};

export default DemarrerMenu;
