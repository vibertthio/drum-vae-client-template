import React, { Component } from 'react';
import { render } from 'react-dom';
import uuid4 from 'uuid/v4';
import styles from './index.module.scss';
import info from './assets/info.png';
import SamplesManager from './music/samples-manager';
import Renderer from './renderer';
import { timestamp } from 'most';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      playing: false,
      loadingProgress: 0,
      loadingSamples: true,
      currentTableIndex: 4,
      samplesManager: new SamplesManager((i) => {
        this.handleLoadingSamples(i);
      }),
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
    };

    this.canvas = [];
    this.beat = 0;
    this.onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentDidMount() {
    this.renderer = new Renderer(this.canvas);
    if (!this.state.loadingSamples) {
      this.renderer.draw(this.state.screen);
    }
    window.addEventListener('resize', this.handleResize.bind(this, false));
    window.addEventListener('click', this.handleClick.bind(this));
    requestAnimationFrame(() => { this.update() });
    
    this.getDrumVaeStatic();
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleClick);
    window.addEventListener('resize', this.handleResize.bind(this, false));
  }

  getDrumVaeRandom() {
    const url = [
      'http://140.109.135.76:5000/rand',
      'http://140.109.21.193:5000/rand',
    ]
    fetch(url[1], {
      headers: {
        'content-type': 'application/json'
      },
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
    })
      .then(r => r.json())
      .then(d => {
        this.matrix = d['result'];
        this.renderer.changeMatrix(d['result']);
        this.state.samplesManager.changeTable(d['result'][4]);
        this.state.samplesManager.start();
      })
      .catch(e => console.log(e));
  }

  getDrumVaeStatic() {
    const url = 'http://140.109.21.193:5000/static'
    fetch(url, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
    })
      .then(r => r.json())
      .then(d => {
        this.matrix = d['result'];
        this.renderer.changeMatrix(d['result']);
        this.state.samplesManager.changeTable(d['result'][4]);
        this.state.samplesManager.start();
      })
      .catch(e => console.log(e));
  }

  getDrumVaeStaticShift(dir = 0, step = 0.2) {
    const url = 'http://140.109.21.193:5000/static/' + dir.toString() + '/' + step.toString();
    fetch(url, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
    })
      .then(r => r.json())
      .then(d => {
        this.matrix = d['result'];
        this.renderer.changeMatrix(d['result']);
        this.state.samplesManager.changeTable(d['result'][4]);
        this.state.samplesManager.start();
      })
      .catch(e => console.log(e));
  }

  setDrumVaeDim(d1 = 3, d2 = 2) {
    const url = 'http://140.109.21.193:5000/dim/' + d1.toString() + '/' + d2.toString();
    fetch(url, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
    })
      .then(r => r.json())
      .then(d => {
        this.matrix = d['result'];
        this.renderer.changeMatrix(d['result']);
        this.state.samplesManager.changeTable(d['result'][4]);
        this.state.samplesManager.start();
      })
      .catch(e => console.log(e));
  }

  update() {
    const b = this.state.samplesManager.beat;
    if (!this.state.loadingSamples) {
      this.renderer.draw(this.state.screen, b);
    }
    requestAnimationFrame(() => { this.update() });
  }

  handleResize(value, e) {
    this.setState({
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  handleClick(e) {
    e.stopPropagation();
    const index = this.renderer.handleClick(e);
    this.changeTableIndex(index);
  }

  onClick() {
    const { open } = this.state;
    if (open) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  onKeyDown(event) {
    const { loadingSamples } = this.state;
    if (!loadingSamples) {
      if (event.keyCode === 32) {
        // space
        const playing = this.state.samplesManager.trigger();
        this.setState({
          playing,
        });
      }
      if (event.keyCode === 65) {
        // a
        console.log('dims: 3, 2');
        this.setDrumVaeDim(3, 2);
      }
      if (event.keyCode === 66) {
        // b
        console.log('dims: 5, 6');
        this.setDrumVaeDim(5, 6);
      }
      if (event.keyCode === 67) {
        // c
        const i = [Math.floor(Math.random() * 32), Math.floor(Math.random() * 32)];
        console.log(`random dims: ${i}`);
        this.setDrumVaeDim(i[0], i[1]);
      }
      if (event.keyCode === 82) {
        // r
        this.getDrumVaeRandom();
      }
      if (event.keyCode === 38) {
        // up
        this.getDrumVaeStaticShift(0, 0.01);
      }
      if (event.keyCode === 40) {
        // down
        this.getDrumVaeStaticShift(1, 0.01);
      }
      if (event.keyCode === 37) {
        // left
        this.getDrumVaeStaticShift(2, 0.01);
      }
      if (event.keyCode === 39) {
        // right
        this.getDrumVaeStaticShift(3, 0.01);
      }

    }
  }

  changeTableIndex(currentTableIndex) {
    this.state.samplesManager.changeTable(this.matrix[currentTableIndex]);
    this.setState({
      currentTableIndex,
    });
  }

  openMenu() {
    document.getElementById('menu').style.height = '100%';
    this.setState({
      open: true,
    });
  }

  closeMenu() {
    document.getElementById('menu').style.height = '0%';
    this.setState({
      open: false,
    });
  }

  handleLoadingSamples(amt) {
    this.setState({
      loadingProgress: amt,
    });
    if (amt === 8) {
      const playing = this.state.samplesManager.trigger();
      this.setState({
        playing,
        loadingSamples: false,
      });
    }
  }

  render() {
    const loadingText = `loading..${this.state.loadingProgress}/9`;
    const { playing, currentTableIndex } = this.state;
    const arr = Array.from(Array(9).keys());
    const mat = Array.from(Array(9 * 16).keys());
    return (
      <div>
        <div className={styles.title}>
          <a href="https://github.com/vibertthio/looop" target="_blank" rel="noreferrer noopener">
            Drum VAE | MAC Lab
          </a>
          <button className={styles.btn} onClick={() => this.onClick()}>
            <img alt="info" src={info} />
          </button>
        </div>
        <div>
          {this.state.loadingSamples && (
            <div className={styles.loadingText}>
              <p>{loadingText}</p>
            </div>
          )}
        </div>
        <div>
          <canvas
            ref={ c => this.canvas = c }
            className={styles.canvas}
            width={this.state.screen.width * this.state.screen.ratio}
            height={this.state.screen.height * this.state.screen.ratio}
          />
        </div>
        <div className={styles.foot}>
          <a href="https://vibertthio.com/portfolio/" target="_blank" rel="noreferrer noopener">
            Vibert Thio
          </a>
        </div>
        <div id="menu" className={styles.overlay}>
          <button className={styles.overlayBtn} onClick={() => this.onClick()} />
          <div className={styles.intro}>
            <p>
              <strong>Drum VAE</strong> <br />Press space to play/stop the music. Click on any block to change samples. Made by{' '}
              <a href="https://vibertthio.com/portfolio/" target="_blank" rel="noreferrer noopener">
                Vibert Thio
              </a>.{' Source code is on '}
              <a
                href="https://github.com/vibertthio/karesansui"
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub.
              </a>
            </p>
          </div>
          <button className={styles.overlayBtn} onClick={() => this.onClick()} />
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
