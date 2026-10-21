// `with { type: 'json' }` lets both Vite and plain Node (tests) load these.
import hi from './hi.json' with { type: 'json' }
import en from './en.json' with { type: 'json' }

const DICTS = { hi, en }
export const LANGS = Object.keys(DICTS)

const MARK = '\u0000'

/**
 * Like t(), but puts a React node (e.g. an animated number) where {placeholder} sits,
 * whatever word order the translation uses.
 */
export function tNode(t, key, placeholder, node) {
  const [before, after = ''] = t(key, { [placeholder]: MARK }).split(MARK)
  return [before, node, after]
}

/** Returns t(key, vars) for a language. Falls back to English, then the key itself. */
export function makeT(lang) {
  const dict = DICTS[lang] ?? en
  const t = (key, vars = {}) =>
    String(dict[key] ?? en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
  t.form = (form) => dict.forms?.[form] ?? form // as counted: "15 tablets"
  t.formName = (form) => dict.formNames?.[form] ?? form // as a label: "Tablet"
  return t
}
