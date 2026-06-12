import React from "react";
import Moveable from "react-moveable";

interface MoveableRedBoxProps {
  step: number;
  uploadedImage: string | null;
  redBoxRef: React.RefObject<HTMLDivElement>;
  fingerPosition: { x: number; y: number };
  ringScale: number;
  dragTranslate: number[];
  ringRotation: number;
  moveableRedBoxRef: React.RefObject<any>;
  cumulativeTranslate: React.MutableRefObject<number[]>;
  latestScale: React.MutableRefObject<number>;
  latestRotation: React.MutableRefObject<number>;
  setDragTranslate: (t: number[]) => void;
  setRingScale: (s: number) => void;
  setRingRotation: (r: number) => void;
}

export function MoveableRedBox({
  step,
  uploadedImage,
  redBoxRef,
  fingerPosition,
  ringScale,
  dragTranslate,
  ringRotation,
  moveableRedBoxRef,
  cumulativeTranslate,
  latestScale,
  latestRotation,
  setDragTranslate,
  setRingScale,
  setRingRotation,
}: MoveableRedBoxProps) {
  if (!uploadedImage || (step !== 2 && step !== 3)) return null;

  return (
    <>
      <div
        ref={step === 2 ? redBoxRef : undefined}
        className="absolute border-2 border-red-500 bg-red-500/25 pointer-events-auto"
        style={{
          left: `${fingerPosition.x}%`,
          top: `${fingerPosition.y}%`,
          width: `${48 * ringScale}px`,
          height: `${18 * ringScale}px`,
          transform: `translate(${dragTranslate[0]}px, ${dragTranslate[1]}px) rotate(${ringRotation}deg)`,
          cursor: step === 2 ? "move" : "default",
          touchAction: "none",
        }}
      />
      {step === 2 && (
        <Moveable
          ref={moveableRedBoxRef}
          target={redBoxRef}
          draggable={true}
          resizable={true}
          rotatable={true}
          keepRatio={true}
          origin={false}
          throttleRotate={0}
          pinchable={true}
          onPinchStart={({ set }) => {
            set(cumulativeTranslate.current);
          }}
          onDragStart={({ set }) => {
            set(cumulativeTranslate.current);
          }}
          onResizeStart={({ dragStart }) => {
            dragStart && dragStart.set(cumulativeTranslate.current);
          }}
          onRotateStart={({ dragStart }) => {
            dragStart && dragStart.set(cumulativeTranslate.current);
          }}
          onDrag={(e) => {
            cumulativeTranslate.current = e.beforeTranslate;
            e.target.style.transform = e.transform;
          }}
          onDragEnd={() => {
            setDragTranslate(cumulativeTranslate.current);
          }}
          onResize={(e) => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.transform;
            cumulativeTranslate.current = e.drag.beforeTranslate;
            latestScale.current = e.width / 48;
          }}
          onResizeEnd={() => {
            setRingScale(latestScale.current);
            setDragTranslate(cumulativeTranslate.current);
          }}
          onRotate={(e) => {
            e.target.style.transform = e.transform;
            cumulativeTranslate.current = e.drag.beforeTranslate;
            latestRotation.current = e.rotation;
          }}
          onRotateEnd={() => {
            setRingRotation(latestRotation.current);
            setDragTranslate(cumulativeTranslate.current);
          }}
        />
      )}
    </>
  );
}
