import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun } from 'docx'

function htmlToText(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.innerText || div.textContent || ''
}

export async function exportAsTxt(html: string, filename: string) {
  const text = htmlToText(html)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${filename}.txt`)
}

export async function exportAsSrt(html: string, filename: string, segments?: { startTime: number; endTime: number; text: string }[]) {
  let srt = ''
  if (segments?.length) {
    segments.forEach((seg, i) => {
      srt += `${i + 1}\n`
      srt += `${formatSrtTime(seg.startTime)} --> ${formatSrtTime(seg.endTime)}\n`
      srt += `${seg.text}\n\n`
    })
  } else {
    const text = htmlToText(html)
    srt = `1\n00:00:00,000 --> 00:99:99,999\n${text}\n`
  }
  const blob = new Blob([srt], { type: 'text/srt;charset=utf-8' })
  saveAs(blob, `${filename}.srt`)
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

export async function exportAsPdf(html: string, filename: string) {
  const text = htmlToText(html)
  const doc = new jsPDF()
  const lines = doc.splitTextToSize(text, 180)
  doc.setFontSize(11)
  let y = 15
  for (const line of lines) {
    if (y > 280) {
      doc.addPage()
      y = 15
    }
    doc.text(line, 15, y)
    y += 6
  }
  doc.save(`${filename}.pdf`)
}

export async function exportAsDocx(html: string, filename: string) {
  const text = htmlToText(html)
  const paragraphs = text.split('\n').filter(Boolean).map(
    (line) =>
      new Paragraph({
        children: [new TextRun(line)],
      })
  )

  const doc = new Document({
    sections: [{ children: paragraphs }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${filename}.docx`)
}
