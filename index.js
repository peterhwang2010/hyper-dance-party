exports.decorateConfig = (config) => {
  var colorOptions = null;
  var danceParty = true;
  var danceCursor = true;
  var extreme = false;
  const pluginConfig = config.plugins;
  if (pluginConfig !== undefined && pluginConfig["hyper-dance-party"] !== undefined) {
    colorOptions = pluginConfig["hyper-dance-party"]["rainbowColors"];
    extreme = pluginConfig["hyper-dance-party"]["extreme"];
    if (pluginConfig["hyper-dance-party"]["danceParty"] !== undefined) {
      danceParty = pluginConfig["hyper-dance-party"]["danceParty"];
    }
    if (pluginConfig["hyper-dance-party"]["danceCursor"] !== undefined) {
      danceCursor = pluginConfig["hyper-dance-party"]["danceCursor"];
    }
  }
  if (colorOptions === null || colorOptions === undefined) {
    colorOptions = [
      'red',
      '#ff6600',
      '#ffff00',
      '#33ff00',
      '#00ffff',
      '#0070ff',
      '#cc00ff'
    ]
  }

  const css = `
    @keyframes rainbow-color {
        0%   {color: ${colorOptions[0]};}
        15%  {color: ${colorOptions[1]};}
        30%  {color: ${colorOptions[2]};}
        45%  {color: ${colorOptions[3]};}
        60%  {color: ${colorOptions[4]};}
        75%  {color: ${colorOptions[5]};}
        90%  {color: ${colorOptions[6]};}
        100% {color: ${colorOptions[0]};}
    }
    @keyframes rainbow-border {
        0%   {border-color: ${colorOptions[0]};}
        15%  {border-color: ${colorOptions[1]};}
        30%  {border-color: ${colorOptions[2]};}
        45%  {border-color: ${colorOptions[3]};}
        60%  {border-color: ${colorOptions[4]};}
        75%  {border-color: ${colorOptions[5]};}
        90%  {border-color: ${colorOptions[6]};}
        100% {border-color: ${colorOptions[0]};}
    }
    @keyframes rainbow-extreme {
        0%   {background-color: ${colorOptions[0]};border-color: ${colorOptions[0]};}
        15%  {background-color: ${colorOptions[1]};border-color: ${colorOptions[1]};}
        30%  {background-color: ${colorOptions[2]};border-color: ${colorOptions[2]};}
        45%  {background-color: ${colorOptions[3]};border-color: ${colorOptions[3]};}
        60%  {background-color: ${colorOptions[4]};border-color: ${colorOptions[4]};}
        75%  {background-color: ${colorOptions[5]};border-color: ${colorOptions[5]};}
        90%  {background-color: ${colorOptions[6]};border-color: ${colorOptions[6]};}
        100% {background-color: ${colorOptions[0]};border-color: ${colorOptions[0]};}
    }
    .rainbow-slow-color {
      animation-name: rainbow-color;
      animation-duration: 120s;
      animation-iteration-count: infinite;
    }
    .rainbow-fast-color {
      animation-name: rainbow-color;
      animation-duration: 1s;
      animation-iteration-count: infinite;
    }
    .rainbow-slow-border-color {
      animation-name: rainbow-border;
      animation-duration: 120s;
      animation-iteration-count: infinite;
    }
    .rainbow-fast-border-color {
      animation-name: rainbow-border;
      animation-duration: 1s;
      animation-iteration-count: infinite;
    }
    .rainbow-fast-extreme {
      animation-name: rainbow-extreme;
      animation-duration: 1s;
      animation-iteration-count: infinite;
    }
    .rainbow-transparent {
      background-color: transparent !important;
    }
  `

  return Object.assign({}, config, {
    danceParty: danceParty,
    danceCursor: danceCursor,
    rainbowExtreme: extreme,
    rainbowCSS: css,
    css: `
      ${config.css || ''}
      ${css}
    `
  });
};

var rainbowInterval = null;

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);
      this._hyperTermDiv = document.getElementById('mount').children[0].getElementsByClassName('hyperterm_main')[0];
      this._onCursorChange = this._onCursorChange.bind(this);
      this._xscreenDiv = null;
      this._danceParty = config.getConfig().danceParty;
      this._danceCursor = config.getConfig().danceCursor;
      this._extreme = config.getConfig().rainbowExtreme;
      this._cursorShape = config.getConfig().cursorShape;
      this._customCSS = `
        ${this.props.customCSS || ''}
        ${config.getConfig().rainbowCSS}
      `;
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._rainbowOnTerminal.bind(this),
        customCSS: this._customCSS
      }));
    }

    _rainbowOnTerminal (term) {
      if (this.props.onTerminal) this.props.onTerminal(term);
      this._xscreenDiv = term.document_.body.getElementsByTagName('x-screen')[0];
      this._hyperTermDiv.classList.add('rainbow-slow-border-color');
      this._cursor = term.cursorNode_;
      if (this._danceCursor) {
        if (this._cursorShape === "BEAM" || this._cursorShape === "UNDERLINE") {
          this._cursor.classList.add("rainbow-fast-border-color");
          this._cursor.classList.add("rainbow-transparent");
        } else {
          this._cursor.classList.add("rainbow-fast-extreme");
        }
      }
      this._rainbowObserver = new MutationObserver(this._onCursorChange);
      this._rainbowObserver.observe(this._cursor, {
        attributes: true,
        childList: false,
        characterData: false
      });
    }

    _onCursorChange () {
      if (this._danceParty) {
        this._setDanceModeOn();
        clearInterval(rainbowInterval);
        rainbowInterval = setInterval(this._setDanceModeOff.bind(this), 500);
      }
    }

    _setDanceModeOn () {
      this._hyperTermDiv.classList.remove('rainbow-slow-border-color');
      this._hyperTermDiv.classList.add('rainbow-fast-border-color');
      if (this._extreme === true) {
        this._xscreenDiv.classList.add('rainbow-fast-extreme');
        this._hyperTermDiv.classList.add('rainbow-fast-extreme');
      }
    }

    _setDanceModeOff () {
      this._hyperTermDiv.classList.add('rainbow-slow-border-color');
      this._hyperTermDiv.classList.remove('rainbow-fast-border-color');
      if (this._extreme === true) {
        this._xscreenDiv.classList.remove('rainbow-fast-extreme');
        this._hyperTermDiv.classList.remove('rainbow-fast-extreme');
      }
    }
  }
};
