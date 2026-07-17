import { useEffect } from "react";

type TBodyStyleSnapshot = {
  overflow: string;
  position: string;
  top: string;
  right: string;
  left: string;
  width: string;
};

const lockIds = new Set<symbol>();
let bodyStyleSnapshot: TBodyStyleSnapshot | undefined;
let scrollTop = 0;

export default function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const lockId = Symbol("scroll-lock");

    lockBodyScroll(lockId);

    return () => {
      unlockBodyScroll(lockId);
    };
  }, [isLocked]);
}

function lockBodyScroll(lockId: symbol) {
  if (lockIds.size === 0) {
    const bodyStyle = document.body.style;

    bodyStyleSnapshot = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      right: bodyStyle.right,
      left: bodyStyle.left,
      width: bodyStyle.width,
    };
    scrollTop = window.scrollY;

    bodyStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollTop}px`;
    bodyStyle.right = "0";
    bodyStyle.left = "0";
    bodyStyle.width = "100%";
  }

  lockIds.add(lockId);
}

function unlockBodyScroll(lockId: symbol) {
  lockIds.delete(lockId);

  if (lockIds.size > 0 || !bodyStyleSnapshot) {
    return;
  }

  const bodyStyle = document.body.style;

  bodyStyle.overflow = bodyStyleSnapshot.overflow;
  bodyStyle.position = bodyStyleSnapshot.position;
  bodyStyle.top = bodyStyleSnapshot.top;
  bodyStyle.right = bodyStyleSnapshot.right;
  bodyStyle.left = bodyStyleSnapshot.left;
  bodyStyle.width = bodyStyleSnapshot.width;

  window.scrollTo(0, scrollTop);
  bodyStyleSnapshot = undefined;
  scrollTop = 0;
}
