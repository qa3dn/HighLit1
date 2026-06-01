import { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';

export interface SettingsFields {
  systemName: string;
  language: 'ar' | 'en';
  timezone: string;
  currentPassword?: string;
  newPassword?: string;
  twoFactorEnabled: boolean;
  emailAlerts: boolean;
  inAppAlerts: boolean;
}

const INITIAL_SETTINGS: SettingsFields = {
  systemName: 'لوحة التحكم الرئيسية',
  language: 'ar',
  timezone: 'Asia/Riyadh',
  currentPassword: '',
  newPassword: '',
  twoFactorEnabled: true,
  emailAlerts: true,
  inAppAlerts: false,
};

export const useSettings = () => {
  const { systemName, setSystemName } = useSystem();

  const [settings, setSettings] = useState<SettingsFields>({
    ...INITIAL_SETTINGS,
    systemName: systemName,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form field if global systemName changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings((prev) => ({
      ...prev,
      systemName,
    }));
  }, [systemName]);

  // Update a single text/select field
  const updateField = <K extends keyof SettingsFields>(key: K, value: SettingsFields[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Reset success/error states on typing
    if (saveSuccess) setSaveSuccess(false);
    if (error) setError(null);
  };

  // Toggle boolean fields (e.g. 2FA, notifications)
  const toggleField = (key: 'twoFactorEnabled' | 'emailAlerts' | 'inAppAlerts') => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (saveSuccess) setSaveSuccess(false);
    if (error) setError(null);
  };

  // Simulate API save call
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Simulate a quick check if passwords match the schema (e.g. if one is filled, both should be filled)
      if (
        (settings.currentPassword || settings.newPassword) &&
        (!settings.currentPassword || !settings.newPassword)
      ) {
        throw new Error('يجب إدخال كلمة المرور الحالية والجديدة معاً لتغييرها.');
      }

      setSaveSuccess(true);
      // Update global context state
      setSystemName(settings.systemName);

      // Clear password fields on success
      setSettings((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));
    } catch (err: unknown) {
      setError((err as Error).message || 'حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to initial settings
  const handleCancel = () => {
    setSettings({
      ...INITIAL_SETTINGS,
      systemName,
    });
    setSaveSuccess(false);
    setError(null);
  };

  return {
    settings,
    isSaving,
    saveSuccess,
    error,
    updateField,
    toggleField,
    handleSave,
    handleCancel,
  };
};