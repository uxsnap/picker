import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Picker.scss";

const Picker = ({
  options,
  visibleItems = 3,
  maskPositions = Math.floor(visibleItems / 2),
  transition = 400,
  defaultValue = options[0],
  onChange,
  velocity = 20,
}) => {
  const listRef = useRef(null);
  const [itemHeight, setItemHeight] = useState(0);
  const [curScroll, setCurScroll] = useState(0);

  const yAxis = useRef({
    isMoving: false,
    start: 0,
    end: 0,
  });

  const velocityObject = useRef({
    y: 0,
    time: Date.now(),
    value: 0,
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

  const getItemIndex = (newCurScroll) => Math.floor(newCurScroll / itemHeight);

  const getPageY = (event) => (event.touches ? event.touches[0] : event).pageY;

  const updateVelocity = (newCurScroll) => {
    const now = Date.now();

    const dt = now - velocityObject.time;
    const dS = newCurScroll - velocityObject.y;

    velocityObject.velocity = dS / dt;
    velocityObject.y = dS;
    velocityObject.time = dt;
  };

  const checkBorders = (newCurScroll) => {
    const listHeight =
      listRef.current.offsetHeight - getListHeight() + itemHeight;

    if (newCurScroll <= -itemHeight) {
      return -itemHeight;
    }

    if (listHeight <= newCurScroll) {
      return listHeight;
    }

    return newCurScroll;
  };

  const onStart = (event) => {
    yAxis.current.isMoving = true;
    yAxis.current.start = getPageY(event);
  };

  const onMove = (event) => {
    if (!yAxis.current.isMoving) {
      return;
    }

    let newCurScroll =
      yAxis.current.start + yAxis.current.end - getPageY(event);

    if (newCurScroll !== velocityObject.y) {
      updateVelocity(newCurScroll);
    }

    newCurScroll = checkBorders(newCurScroll);

    setCurScroll(newCurScroll);
    yAxis.current.end = newCurScroll;
  };

  const onEnd = () => {
    yAxis.current.isMoving = false;

    let newCurScroll = yAxis.current.end;

    if (velocityObject.velocity) {
      newCurScroll += velocityObject.velocity * velocity;
    }

    if (newCurScroll % options.length !== 0) {
      newCurScroll = getItemIndex(newCurScroll) * itemHeight;
    }

    newCurScroll = checkBorders(newCurScroll);

    setCurScroll(newCurScroll);
    onChange(options[getItemIndex(newCurScroll) + 1]);
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
