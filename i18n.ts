// ============================================
// ChefHub - i18n Configuration
// ============================================

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale || 'ar';
  
  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});
