// Core: bind htm to a thin createElement wrapper so we can author JSX-like
// markup with NO build step — and use the natural HTML attribute names
// `class` / `for`, which the wrapper maps to React's `className` / `htmlFor`.
import React from "react";
import htm from "htm";

function h(type, props, ...children) {
  if (props) {
    if ("class" in props) {
      props.className = props.class;
      delete props.class;
    }
    if ("for" in props) {
      props.htmlFor = props.for;
      delete props.for;
    }
  }
  return React.createElement(type, props, ...children);
}

export const html = htm.bind(h);
export default React;
export const {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
  createContext,
  Fragment,
} = React;
