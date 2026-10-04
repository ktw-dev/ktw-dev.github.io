/**
 * Theme management class
 *
 * Supports three preferences: light, dark and system (follows the OS).
 * An explicit light/dark choice is kept in localStorage; no stored value means system.
 *
 * To reduce flickering during page load, this script should be loaded synchronously.
 */
class Theme {
  static #modeKey = 'mode';
  static #modeAttr = 'data-mode';
  static #darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  static switchable = !document.documentElement.hasAttribute(this.#modeAttr);

  static get DARK() {
    return 'dark';
  }

  static get LIGHT() {
    return 'light';
  }

  static get SYSTEM() {
    return 'system';
  }

  /**
   * @returns {string} Theme mode identifier
   */
  static get ID() {
    return 'theme-mode';
  }

  /**
   * Gets the current visual state of the theme.
   *
   * @returns {string} The current visual state, either the mode if it exists,
   *                   or the system dark mode state ('dark' or 'light').
   */
  static get visualState() {
    if (this.#hasMode) {
      return this.#mode;
    } else {
      return this.#sysDark ? this.DARK : this.LIGHT;
    }
  }

  /**
   * Gets the user's preference.
   *
   * @returns {string} 'light', 'dark' or 'system'
   */
  static get preference() {
    return this.#hasMode ? this.#mode : this.SYSTEM;
  }

  static get #mode() {
    try {
      const mode = localStorage.getItem(this.#modeKey);
      return mode === this.DARK || mode === this.LIGHT ? mode : null;
    } catch {
      return null;
    }
  }

  static get #hasMode() {
    return this.#mode !== null;
  }

  static get #sysDark() {
    return this.#darkMedia.matches;
  }

  /**
   * Maps theme modes to provided values
   * @param {string} light Value for light mode
   * @param {string} dark Value for dark mode
   * @returns {Object} Mapped values
   */
  static getThemeMapper(light, dark) {
    return {
      [this.LIGHT]: light,
      [this.DARK]: dark
    };
  }

  /**
   * Initializes the theme based on system preferences or stored mode
   */
  static init() {
    if (!this.switchable) {
      return;
    }

    // Older versions stored the mode per session; drop it so it cannot shadow the new preference
    try {
      sessionStorage.removeItem(this.#modeKey);
    } catch {
      // storage may be unavailable (e.g. blocked site data)
    }

    this.#darkMedia.addEventListener('change', () => {
      if (!this.#hasMode) {
        this.#notify();
      }
    });

    if (this.#hasMode) {
      this.#apply(this.#mode);
    }
  }

  /**
   * Sets the theme preference
   * @param {string} preference 'light', 'dark' or 'system'
   */
  static set(preference) {
    if (!this.switchable) {
      return;
    }

    const lastState = this.visualState;

    if (preference === this.LIGHT || preference === this.DARK) {
      this.#apply(preference);
      this.#store(preference);
    } else {
      document.documentElement.removeAttribute(this.#modeAttr);
      this.#store(null);
    }

    if (lastState !== this.visualState) {
      this.#notify();
    }
  }

  /**
   * Cycles the preference: system → light → dark → system
   */
  static flip() {
    const next = {
      [this.SYSTEM]: this.LIGHT,
      [this.LIGHT]: this.DARK,
      [this.DARK]: this.SYSTEM
    };

    this.set(next[this.preference]);
  }

  static #apply(mode) {
    document.documentElement.setAttribute(this.#modeAttr, mode);
  }

  static #store(mode) {
    try {
      if (mode === null) {
        localStorage.removeItem(this.#modeKey);
      } else {
        localStorage.setItem(this.#modeKey, mode);
      }
    } catch {
      // the preference still applies to the current page
    }
  }

  /**
   * Notifies other plugins that the theme mode has changed
   */
  static #notify() {
    window.postMessage({ id: this.ID }, '*');
  }
}

Theme.init();

export default Theme;
