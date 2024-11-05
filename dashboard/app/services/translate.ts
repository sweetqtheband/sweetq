import i18next, { Resource } from 'i18next';
import { I18n } from 'next-i18next';
import { uuid } from '../utils';
import es from '../locales/es.json';
import en from '../locales/en.json';

const resources: Resource = {
  en: { translation: en },
  es: { translation: es },
};

class TranslateClass {
  private static instance: TranslateClass | null = null;

  public id: string = uuid();
  public i18n: I18n | null = null;

  public static getInstance() {
    if (!TranslateClass.instance) {
      TranslateClass.instance = new TranslateClass();
    }
    return TranslateClass.instance;
  }

  async init(locale: string = 'es'): Promise<void> {
    if (!this.i18n) {
      await i18next.init({
        lng: locale,
        fallbackLng: 'en',
        resources,
      });

      this.i18n = i18next;
    }
  }

  t(key: string, options?: any): string {
    return this.i18n?.t(key, options) as string;
  }
}

export default TranslateClass.getInstance();
