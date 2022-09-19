export function download(filename: string, data: Blob) {
  const a = document.createElement("a");
  a.setAttribute("href", URL.createObjectURL(data));
  a.setAttribute("download", filename);
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
