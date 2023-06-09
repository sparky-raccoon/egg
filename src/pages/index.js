import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "react-modal";
import Head from "next/head";
import yellowPng from "../../public/yellow.png";
import whitePng from "../../public/white.png";
import styles from "@/styles/Home.module.css";

Modal.setAppElement("#__next");

const MODAL_TEXTS = {
  FILLED: {
    title: "Eggselent, the canvas is filled.",
    content: "Type 'R' to reset the canvas or 'esc' to close this dialog.",
  },
  NO_SPACE_FOR_E: {
    title: "Only yellows, please.",
    content:
      "Type 'R' to reset the canvas, add more yellows with 'G', or 'esc' to close this dialog.",
  },
};

export default function Home() {
  const [finalEgg, setFinalEgg] = useState("");
  const [drawingPos, setDrawingPos] = useState({ x: -10, y: 0 });
  const [yellowObject, setYellowObject] = useState();
  const [whiteObject, setWhiteObject] = useState();
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [pressedKey, setPressedKey] = useState("");
  const [isCanvasFilled, setIsCanvasFilled] = useState(false);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [modalText, setModalText] = useState(null);

  const canvasRef = useRef(null);

  const updateCanvas = useCallback(
    (kind) => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const canvasWidth = context.canvas.clientWidth;
      const canvasHeight = context.canvas.clientHeight;

      if (!kind) {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        return;
      }

      const {
        img,
        width: imgW,
        height: imgH,
      } = kind === "e" ? whiteObject : yellowObject;

      const { x: drawingPosX, y: drawingPosY } = drawingPos;
      let newReachedPosX = drawingPosX + imgW;
      let newReachedPosY = drawingPosY + imgH;
      let newDrawingPosX = drawingPosX + 10;
      let newDrawingPosY = drawingPosY;

      if (newReachedPosX > canvasWidth) {
        if (newReachedPosY + 50 <= canvasHeight) {
          newDrawingPosX = 0;
          newDrawingPosY = newDrawingPosY + 50;
        } else {
          if (kind === "e" && drawingPosX + yellowObject.width <= canvasWidth) {
            setModalText(MODAL_TEXTS.NO_SPACE_FOR_E);
            setIsModalOpened(true);
          } else {
            setIsCanvasFilled(true);
            setModalText(MODAL_TEXTS.FILLED);
            setIsModalOpened(true);
          }
          return;
        }
      }

      if (newReachedPosY > canvasHeight) {
        if (kind === "e" && drawingPosY + yellowObject.height <= canvasHeight) {
          setModalText(MODAL_TEXTS.NO_SPACE_FOR_E);
          setIsModalOpened(true);
        }
        return;
      }

      context.save();
      context.translate(newDrawingPosX, newDrawingPosY);
      context.drawImage(img, 0, 0);
      context.restore();

      setDrawingPos({
        x: newDrawingPosX,
        y: newDrawingPosY,
      });

      return true;
    },
    [whiteObject, yellowObject, drawingPos]
  );

  const addE = useCallback(() => {
    if (isModalOpened) return;

    if (isCanvasFilled) {
      setIsModalOpened(true);
    }

    const successfullyUpdated = updateCanvas("e");
    successfullyUpdated && setFinalEgg(finalEgg + "e");
  }, [isCanvasFilled, isModalOpened, finalEgg, updateCanvas]);

  const addGG = useCallback(() => {
    if (isModalOpened) {
      if (modalText?.title === MODAL_TEXTS.NO_SPACE_FOR_E.title)
        setIsModalOpened(false);
      else return;
    }

    if (isCanvasFilled) {
      setIsModalOpened(true);
    }

    const successfullyUpdated = updateCanvas("gg");
    successfullyUpdated && setFinalEgg(finalEgg + "gg");
  }, [isCanvasFilled, isModalOpened, modalText, finalEgg, updateCanvas]);

  const reset = useCallback(() => {
    updateCanvas();
    setFinalEgg("");
    setDrawingPos({ x: -10, y: 0 });
    setIsCanvasFilled(false);
    setIsModalOpened(false);
    setModalText(null);
  }, [updateCanvas]);

  const downloadEgg = () => {
    if (finalEgg.length === 0) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "egg.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const onKeyDown = useCallback(
    ({ key }) => {
      const letter = key.toUpperCase();
      switch (letter) {
        case "E":
          addE();
          setPressedKey("E");
          break;
        case "G":
          addGG();
          setPressedKey("G");
          break;
        case "R":
          reset();
          setPressedKey("R");
          break;
        case "D":
          downloadEgg();
          setPressedKey("D");
          break;
      }
    },
    [addE, addGG, reset]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    // https://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html
    const canvasWidth = context.canvas.clientWidth;
    const canvasHeight = context.canvas.clientHeight;
    context.canvas.width = canvasWidth;
    context.canvas.height = canvasHeight;
    context.fillStyle = "red";

    const yellowImage = new Image();
    const whiteImage = new Image();

    yellowImage.src = yellowPng.src;
    whiteImage.src = whitePng.src;

    const sizeDivider = window.innerWidth > 600 ? 1 : 2;
    yellowImage.onload = () =>
      setYellowObject({
        img: yellowImage,
        width: yellowPng.width / sizeDivider,
        height: yellowPng.height / sizeDivider,
      });
    whiteImage.onload = () =>
      setWhiteObject({
        img: whiteImage,
        width: whitePng.width / sizeDivider,
        height: whitePng.height / sizeDivider,
      });
    setIsCanvasReady(true);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    const onKeyUp = () => setPressedKey("");

    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

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
          <h1 className={styles.title}>
            {'- "an eggsample of how i lose my time on earth"'}
          </h1>
          <a
            href="https://www.buymeacoffee.com/spkyraccoon"
            target="_blank"
            className={styles.buyme}
          >
            buy me a coffee
          </a>
        </header>
        <div className={styles.canvasWrapper}>
          {finalEgg && (
            <p className={styles.result}>{`Illustration of ${
              finalEgg[0] === "e" ? "an" : "a"
            } "${finalEgg}" :`}</p>
          )}
          <canvas
            ref={canvasRef}
            className={`${styles.canvas} ${
              !isCanvasReady && styles.hiddenCanvas
            }`}
          >
            Désolé, votre navigateur ne prend pas en charge &lt;canvas&gt;.
          </canvas>
        </div>
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${
              pressedKey === "E" && styles.hoveredButton
            }`}
            onClick={addE}
          >
            {"E - adds 'e'"}
          </button>
          <button
            className={`${styles.button} ${
              pressedKey === "G" && styles.hoveredButton
            }`}
            onClick={addGG}
          >
            {"G - adds 'gg'"}
          </button>
          <button
            className={`${styles.button} ${
              pressedKey === "R" && styles.hoveredButton
            }`}
            onClick={reset}
          >
            {"R - resets"}
          </button>
          {finalEgg && (
            <button
              className={`${styles.button} ${
                pressedKey === "D" && styles.hoveredButton
              }`}
              onClick={downloadEgg}
            >
              {"D - download"}
            </button>
          )}
        </div>
      </main>
      <Modal
        isOpen={isModalOpened}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          content: {
            position: "initial",
            width: 400,
            display: "flex",
            flexDirection: "column",
            color: "black",
            fontFamily: "monospace",
            border: "2px solid black",
          },
        }}
        onRequestClose={() => setIsModalOpened(false)}
      >
        <h2 className={styles.modalTitle}>{modalText?.title}</h2>
        {modalText?.content}
      </Modal>
    </>
  );
}
