const tailwindWidths = [
    0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
  ];
  
  export function getClosestWidthClass (width: number) {
    // Find the closest width from the list
    const closestWidth = tailwindWidths.reduce((prev, curr) =>
      Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
    );
    return closestWidth;
  };
  