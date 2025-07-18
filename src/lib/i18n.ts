import { Language, Translations } from './types';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

type TranslationStore = {
  [key in Language]: Translations;
};

export const initialTranslations: TranslationStore = {
  en,
  ru,
  uz,
};

// This file can be used to manage translations logic if it becomes more complex.
// For now, it just exports the initial set.
