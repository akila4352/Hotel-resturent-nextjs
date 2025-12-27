import { useState } from 'react'
import ReactCountryFlag from 'react-country-flag'

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')

  const languages = [
    { code: 'en', name: 'English', country: 'GB' },
    { code: 'sv', name: 'Swedish', country: 'SE' },
    { code: 'es', name: 'Español', country: 'ES' },
    { code: 'fr', name: 'Français', country: 'FR' },
    { code: 'de', name: 'Deutsch', country: 'DE' },
    { code: 'it', name: 'Italiano', country: 'IT' },
    { code: 'pt', name: 'Português', country: 'PT' },
    { code: 'ja', name: '日本語', country: 'JP' },
    { code: 'ko', name: '한국어', country: 'KR' },
    { code: 'zh-CN', name: '中文', country: 'CN' },
    { code: 'ar', name: 'العربية', country: 'SA' },
    { code: 'hi', name: 'हिन्दी', country: 'IN' },
    { code: 'si', name: 'සිංහල', country: 'LK' },
  ]

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode)
    setIsOpen(false)

    const select = document.querySelector('.goog-te-combo')
    if (select) {
      select.value = langCode
      select.dispatchEvent(new Event('change'))
    }
  }

  const currentLanguage = languages.find(lang => lang.code === currentLang)

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.button}
      >
        <ReactCountryFlag
          svg
          countryCode={currentLanguage?.country}
          style={styles.flag}
        />
        <span style={styles.langName}>{currentLanguage?.name}</span>
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                ...styles.option,
                // Remove backgroundColor for selected option
                // No background color at all
              }}
            >
              <ReactCountryFlag
                svg
                countryCode={lang.country}
                style={styles.flag}
              />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    fontFamily: "'Playfair Display', serif",
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    color: 'white',
    background: 'none',
    fontFamily: "'Playfair Display', serif",
    textShadow: `
      1px 1px 0 rgba(0,0,0,0.15),
      2px 2px 0 rgba(0,0,0,0.12),
      3px 3px 0 rgba(0,0,0,0.1),
      4px 4px 5px rgba(0,0,0,0.2),
      0 5px 15px rgba(0,0,0,0.25)
    `,
    transition: 'all 0.3s ease',
  },
  flag: {
    width: '22px',
    height: '16px',
  },
  langName: {
    color: 'white',
    fontFamily: "'Playfair Display', serif",
    fontWeight: 600,
    textShadow: `
      1px 1px 0 rgba(0,0,0,0.15),
      2px 2px 0 rgba(0,0,0,0.12),
      3px 3px 0 rgba(0,0,0,0.1),
      4px 4px 5px rgba(0,0,0,0.2),
      0 5px 15px rgba(0,0,0,0.25)
    `,
    transition: 'all 0.3s ease',
  },
  arrow: {
    fontSize: '10px',
    color: 'white',
    fontFamily: "'Playfair Display', serif",
    fontWeight: 600,
    textShadow: `
      1px 1px 0 rgba(0,0,0,0.15),
      2px 2px 0 rgba(0,0,0,0.12),
      3px 3px 0 rgba(0,0,0,0.1),
      4px 4px 5px rgba(0,0,0,0.2),
      0 5px 15px rgba(0,0,0,0.25)
    `,
    transition: 'all 0.3s ease',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '180px',
    maxHeight: '400px',
    overflowY: 'auto',
    background: 'none',
    fontFamily: "'Playfair Display', serif",
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    color: 'white',
    fontFamily: "'Playfair Display', serif",
    fontWeight: 600,
    textShadow: `
      1px 1px 0 rgba(0,0,0,0.15),
      2px 2px 0 rgba(0,0,0,0.12),
      3px 3px 0 rgba(0,0,0,0.1),
      4px 4px 5px rgba(0,0,0,0.2),
      0 5px 15px rgba(0,0,0,0.25)
    `,
    transition: 'all 0.3s ease',
  },
}
