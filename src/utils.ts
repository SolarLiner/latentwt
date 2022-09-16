export function download(filename: string, mime: string, data: string) {
  const a = document.createElement("a");
  a.setAttribute("href", `data:${mime};charset=utf-8;base64,${data}`);
  a.setAttribute("download", filename);
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
