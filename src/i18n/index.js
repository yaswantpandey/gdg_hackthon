import hi from './hi.json'
import en from './en.json'

const DICTS = { hi, en }
export const LANGS = Object.keys(DICTS)

/** Returns t(key, vars) for a language. Falls back to English, then the key itself. */
export function makeT(lang) {
  const dict = DICTS[lang] ?? en
  const t = (key, vars = {}) =>
    String(dict[key] ?? en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
  t.form = (form) => dict.forms?.[form] ?? form // as counted: "15 tablets"
  t.formName = (form) => dict.formNames?.[form] ?? form // as a label: "Tablet"
  return t
}
