import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./Picker.scss";

const Picker = ({
  options,
  visibleItems = 3,
  maskPositions = Math.floor(visibleItems / 2),
  transition = 400,
  defaultValue = options[0],
  onChange,
}) => {
  const listRef = useRef(null);
  const [itemHeight, setItemHeight] = useState(0);
  const [curScroll, setCurScroll] = useState(0);

  const yAxis = useRef({
    isMoving: false,
    start: 0,
    end: 0,
  });

  const getListHeight = () => itemHeight * visibleItems;

  const getListStyles = () => ({
    transform: `translateY(${-curScroll}px)`,
    transition: `${transition}ms`,
  });

  const getRootStyle = () => ({
    height: `${getListHeight()}px`,
  });

  const getMaskStyle = () => ({
    top: `${maskPositions * itemHeight}px`,
    height: `${itemHeight}px`,
  });

  const getPageY = (event) => (event.touches ? event.touches[0] : event).pageY;

  const onStart = (event) => {
    yAxis.current.isMoving = true;
    yAxis.current.start = getPageY(event);
  };

  const onMove = (event) => {
    if (!yAxis.current.isMoving) {
      return;
    }

    const listHeight =
      listRef.current.offsetHeight - getListHeight() + itemHeight;

    let newCurScroll =
      yAxis.current.start + yAxis.current.end - getPageY(event);

    if (newCurScroll < -itemHeight) {
      newCurScroll = -itemHeight;
    } else if (listHeight <= newCurScroll) {
      newCurScroll = listHeight;
    }

    setCurScroll(newCurScroll);
    yAxis.current.end = newCurScroll;
  };

  const onEnd = () => {
    yAxis.current.isMoving = false;

    let newCurScroll = yAxis.current.end;

    if (newCurScroll % options.length !== 0) {
      newCurScroll = Math.floor(newCurScroll / itemHeight) * itemHeight;
    }

    setCurScroll(newCurScroll);
    onChange(Math.floor(newCurScroll / itemHeight));
  };

  const handleClick = (index) => (event) => {
    event.stopPropagation();

    const newCurScroll = (index - 1) * itemHeight;

    setCurScroll(newCurScroll);
    yAxis.current.end = newCurScroll;
    onChange(options[index]);
  };

  useLayoutEffect(() => {
    if (!listRef.current) {
      setItemHeight(0);
    }

    const child = listRef.current.children[0];

    setItemHeight(child.offsetHeight);
  }, []);

  useEffect(() => {
    const optionIndex = options.findIndex((option) => option === defaultValue);

    setCurScroll((optionIndex - 1) * itemHeight);
  }, [defaultValue, itemHeight]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.addEventListener("mousedown", onStart);
    listRef.current.addEventListener("touchstart", onStart);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);

    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    return () => {
      listRef.current?.removeEventListener("mousedown", onStart);
      listRef.current?.removeEventListener("mousedown", onStart);

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);

      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [listRef.current]);

  return (
    <div className="root" style={getRootStyle()}>
      <div className="mask" style={getMaskStyle()}></div>

      <div ref={listRef} className="list" style={getListStyles()}>
        {options?.map((option, ind) => (
          <div onClick={handleClick(ind)} className="item" key={option}>
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Picker;
