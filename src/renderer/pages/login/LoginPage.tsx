/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Button, Input, Message, Tabs } from '@arco-design/web-react';
import { IconLock, IconUser } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/renderer/context/AuthContext';

const TabPane = Tabs.TabPane;

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!username || !password) {
      Message.warning('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const result = await login({ username, password });
      
      if (result.success) {
        Message.success('Connexion réussie');
        navigate('/guid');
      } else {
        Message.error(result.message || 'Échec de la connexion');
      }
    } catch (error) {
      Message.error('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword) {
      Message.warning('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Message.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Message.warning('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    // Simulate signup delay
    setTimeout(() => {
      Message.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      setLoading(false);
      setActiveTab('signin');
      setPassword('');
      setConfirmPassword('');
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'signin') {
        handleSignIn();
      } else {
        handleSignUp();
      }
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-fill-1'>
      <div className='w-full max-w-md p-8'>
        {/* Logo and Title */}
        <div className='flex flex-col items-center mb-8'>
          <img 
            src='/logo_projet/android-chrome-512x512.png' 
            alt='E-audit' 
            className='w-24 h-24 mb-4 object-contain' 
          />
          <h1 className='text-3xl font-bold text-text-1 text-center mb-2'>E-audit</h1>
          <p className='text-base text-text-2 text-center'>Automatisez vos activités, d'audit, risque et contrôle</p>
        </div>

        {/* Login/Signup Form */}
        <div className='bg-fill-2 rounded-lg p-6 shadow-lg border border-solid border-border-2'>
          <Tabs activeTab={activeTab} onChange={setActiveTab} type='rounded'>
            <TabPane key='signin' title='Se connecter'>
              <div className='mt-4'>
                <div className='mb-4'>
                  <Input
                    size='large'
                    placeholder="Nom d'utilisateur"
                    prefix={<IconUser />}
                    value={username}
                    onChange={setUsername}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <div className='mb-6'>
                  <Input.Password
                    size='large'
                    placeholder='Mot de passe'
                    prefix={<IconLock />}
                    value={password}
                    onChange={setPassword}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <Button 
                  type='primary' 
                  size='large' 
                  long 
                  loading={loading} 
                  onClick={handleSignIn}
                >
                  Se connecter
                </Button>
              </div>
            </TabPane>

            <TabPane key='signup' title="S'inscrire">
              <div className='mt-4'>
                <div className='mb-4'>
                  <Input
                    size='large'
                    placeholder="Nom d'utilisateur"
                    prefix={<IconUser />}
                    value={username}
                    onChange={setUsername}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <div className='mb-4'>
                  <Input.Password
                    size='large'
                    placeholder='Mot de passe'
                    prefix={<IconLock />}
                    value={password}
                    onChange={setPassword}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <div className='mb-6'>
                  <Input.Password
                    size='large'
                    placeholder='Confirmer le mot de passe'
                    prefix={<IconLock />}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <Button 
                  type='primary' 
                  size='large' 
                  long 
                  loading={loading} 
                  onClick={handleSignUp}
                >
                  Créer un compte
                </Button>
              </div>
            </TabPane>
          </Tabs>
        </div>

        {/* Footer */}
        <div className='text-center mt-6 text-text-3 text-sm'>
          <p>© 2025 E-audit. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
