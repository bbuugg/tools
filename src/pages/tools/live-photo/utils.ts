const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const findSequence = (data: Uint8Array, sequence: number[]): number => {
  const seqLen = sequence.length;
  const dataLen = data.length;
  for (let i = 0; i <= dataLen - seqLen; i++) {
    let match = true;
    for (let j = 0; j < seqLen; j++) {
      if (data[i + j] !== sequence[j]) { match = false; break; }
    }
    if (match) return i;
  }
  return -1;
};

interface UnpackedResult {
  imageBlob: Blob;
  videoBlob: Blob;
  imageUrl: string;
  videoUrl: string;
  originalName: string;
}

export { downloadBlob, findSequence };
export type { UnpackedResult };
