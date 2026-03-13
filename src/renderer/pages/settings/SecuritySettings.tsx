/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Switch, Message, Divider } from '@arco-design/web-react';
import { ConfigStorage } from '@/common/storage';

const SecuritySettings: React.FC = () => {
  const [loginEnabled, setLoginEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await ConfigStorage.get('security.loginEnabled');
      setLoginEnabled(enabled === true);
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginToggle = async (checked: boolean) => {
    try {
      await ConfigStorage.set('security.loginEnabled', checked);
      setLoginEnabled(checked);

      if (checked) {
        Message.success('Écran de connexion activé. Il sera affiché au prochain démarrage.');
      } else {
        Message.success('Écran de connexion désactivé.');
        // Clear login state
        localStorage.removeItem('eaudit_logged_in');
        localStorage.removeItem('eaudit_login_time');
      }
    } catch (error) {
      console.error('Failed to save security settings:', error);
      Message.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-6 text-0'>Sécurité et Confidentialité</h2>

      <div className='bg-2 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-0 mb-1'>Écran de connexion</h3>
            <p className='text-sm text-2'>Activer un écran de connexion au démarrage de l'application</p>
          </div>
          <Switch checked={loginEnabled} loading={loading} onChange={handleLoginToggle} />
        </div>

        <Divider />

        <div className='text-sm text-3 mt-4'>
          <p className='mb-2'>
            <strong>Note:</strong> Lorsque l'écran de connexion est activé:
          </p>
          <ul className='list-disc list-inside space-y-1 ml-2'>
            <li>Vous devrez vous connecter à chaque démarrage de l'application</li>
            <li>Les identifiants par défaut sont configurables dans les paramètres avancés</li>
            <li>Cette fonctionnalité ajoute une couche de sécurité supplémentaire</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
