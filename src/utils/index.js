export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizeHeader(value) {
  return String(value)
    .replaceAll("\uFEFF", "")
    .replaceAll("\u200B", "")
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll(/[\s_-]+/g, " ")
    .trim();
}

export function parseCsv(text) {
  const normalizedText = String(text).replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const lines = normalizedText.split("\n").filter((line) => line.trim().length > 0);
  return lines.map((line) => parseCsvLine(line));
}

export function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());

  return values;
}

export function csvEscape(value) {
  const strValue = String(value ?? "");
  if (strValue.includes(",") || strValue.includes("\n") || strValue.includes('"')) {
    return `"${strValue.replaceAll('"', '""')}"`;
  }

  return strValue;
}

export function formatDateForFileName(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function downloadTextAsFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
