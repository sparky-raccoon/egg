import { useState, useEffect, useCallback, useRef } from 'react'
import Head from 'next/head'
import Script from 'next/script';
import yellowPng from '../../public/yellow.png';
import whitePng from '../../public/white.png';
import styles from '@/styles/Home.module.css'

export default function Home() {
  const [ finalEgg, setFinalEgg ] = useState('');
  const [ drawingPos, setDrawingPos ] = useState({ x: -10, y: 0 });
  const [ yellowObject, setYellowObject ] = useState();
  const [ whiteObject, setWhiteObject ] = useState();
  const [ isCanvasReady, setIsCanvasReady ] = useState(false);
  const [ pressedKey, setPressedKey ] = useState('');
  const [ isCanvasFilled, setIsCanvasFilled ] = useState(false);

  const canvasRef = useRef(null);

  const updateCanvas = useCallback((kind) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const { width: canvasWidth, height: canvasHeight } = context.canvas;

    if (!kind) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      return;
    }

    const { img, width: imgW, height: imgH } = kind === 'e' ? whiteObject : yellowObject;
    const dx = 0 // kind === 'e' ? 0 : 35;
    const dy = 0 //kind === 'e' ? 0 : 15;
    const { x: drawingPosX, y: drawingPosY } = drawingPos;
    let newReachedPosX = drawingPosX + imgW + dx, newReachedPosY = drawingPosY + imgH + dy;
    let newDrawingPosX = drawingPosX + 10;
    let newDrawingPosY = drawingPosY;

    if (newReachedPosX > canvasWidth - 10) {
      if (newReachedPosY + 100 <= canvasHeight) {
        newDrawingPosX = 0;
        newDrawingPosY = newDrawingPosY + 100;
      } else {
        setIsCanvasFilled(true);
        return;
      }
    }

    if (newReachedPosY > canvasHeight) return;

    context.save();
    context.translate(newDrawingPosX, newDrawingPosY);
    context.translate(dx, dy);
    context.drawImage(img, 0, 0);
    context.restore();

    setDrawingPos({
      x: newDrawingPosX,
      y: newDrawingPosY,
    });

    return true;
  }, [ whiteObject, yellowObject, drawingPos ])

  const addE = useCallback(() => {
    if (isCanvasFilled) return;
    const successfullyUpdated = updateCanvas('e');
    successfullyUpdated && setFinalEgg(finalEgg + 'e');
  }, [ isCanvasFilled, finalEgg, updateCanvas ])

  const addGG = useCallback(() => {
    if (isCanvasFilled) return;
    const successfullyUpdated = updateCanvas('gg');
    successfullyUpdated && setFinalEgg(finalEgg + 'gg');
  }, [ isCanvasFilled, finalEgg, updateCanvas ])

  const reset = useCallback(() => {
    updateCanvas();
    setFinalEgg('');
    setDrawingPos({ x: -10, y: 0 });
    setIsCanvasFilled(false);
  }, [ updateCanvas ])

  const onKeyDown = useCallback(({ key }) => {
    const letter = key.toUpperCase();
    switch (letter) {
      case 'E': 
        addE();
        setPressedKey('E');
        break;
      case 'G':
        addGG();
        setPressedKey('G');
        break;
      case 'R':
        reset();
        setPressedKey('R');
        break;
    }
  }, [ addE, addGG, reset ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'red';
    const CANVAS_SIZE = 400;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const yellowImage = new Image();
    const whiteImage = new Image();

    yellowImage.src = yellowPng.src;
    whiteImage.src = whitePng.src;

    yellowImage.onload = () => setYellowObject({ img: yellowImage, width: yellowPng.width, height: yellowPng.height });
    whiteImage.onload = () => setWhiteObject({ img: whiteImage, width: whitePng.width, height: whitePng.height });
    setIsCanvasReady(true);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    }
  }, [onKeyDown])

  useEffect(() => {
    const onKeyUp = () => setPressedKey('');

    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    }
  }, [])

  return (
    <>
      <Head>
        <title>EGGS</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{'- "an eggsample of how i lose my time on earth"'}</h1>
          <a href="https://www.buymeacoffee.com/spkyraccoon" target="_blank" className={styles.buyme}>buy me a coffee</a>
        </header>
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={`${styles.canvas} ${!isCanvasReady && styles.hiddenCanvas}`}>
            Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
          </canvas>
          {finalEgg && <p className={styles.result}>{`"${finalEgg}"`}</p>}
        </div>
        <div className={styles.buttons}>
          <button className={`${styles.button} ${pressedKey === 'E' && styles.hoveredButton}`} onClick={addE}>{"E - adds 'e'"}</button>
          <button className={`${styles.button} ${pressedKey === 'G' && styles.hoveredButton}`} onClick={addGG}>{"G - adds 'gg'"}</button>
          <button className={`${styles.button} ${pressedKey === 'R' && styles.hoveredButton}`} onClick={reset}>{"R - resets"}</button>
        </div>
      </main>
    </>
  )
}
