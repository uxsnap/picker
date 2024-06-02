import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./Picker.scss";

const Picker = ({
  options,
  visibleItems = 3,
  maskPositions = Math.floor(visibleItems / 2),
  transition = 400,
}) => {
  const listRef = useRef(null);
  const [itemHeight, setItemHeight] = useState(0);
  const [curScroll, setCurScroll] = useState(0);

  const isMoving = useRef(false);
  const startY = useRef(0);
  const finishY = useRef(0);

  const getListHeight = () => {
    return itemHeight * visibleItems;
  };
  const getListStyles = () => ({
    transform: `translateY(${-curScroll}px)`,
    transition: `${transition}ms`,
  });
  const getRootStyle = () => ({
    height: `${itemHeight * visibleItems}px`,
  });
  const getMaskStyle = () => ({
    top: `${maskPositions * itemHeight}px`,
    height: `${itemHeight}px`,
  });

  const onStart = (event) => {
    isMoving.current = true;
    startY.current = event.pageY;
  };

  const onMove = (event) => {
    if (!isMoving.current) {
      return;
    }

    const listHeight =
      listRef.current.offsetHeight - getListHeight() + itemHeight;

    let newCurScroll = startY.current - event.pageY + finishY.current;

    if (newCurScroll < -itemHeight) {
      newCurScroll = -itemHeight;
    } else if (listHeight <= newCurScroll) {
      newCurScroll = listHeight;
    }

    setCurScroll(newCurScroll);
    finishY.current = newCurScroll;
  };

  const onEnd = () => {
    isMoving.current = false;

    const itemsLength = options.length;

    let newCurScroll = finishY.current;

    if (newCurScroll % itemsLength !== 0) {
      newCurScroll = Math.floor(newCurScroll / itemHeight) * itemHeight;
    }

    setCurScroll(newCurScroll);
    finishY.current = newCurScroll;
  };

  useLayoutEffect(() => {
    if (!listRef.current) {
      setItemHeight(0);
    }

    const child = listRef.current.children[0];

    setItemHeight(child.offsetHeight);
  }, []);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    return () => {
      listRef.current?.removeEventListener("mousedown", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [listRef.current]);

  return (
    <div className="root" style={getRootStyle()}>
      <div className="mask" style={getMaskStyle()}></div>

      <div ref={listRef} className="list" style={getListStyles()}>
        {options?.map((option) => (
          <div className="item" key={option}>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Picker;
