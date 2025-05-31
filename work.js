function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toDecimal(n) {
  return (Math.random() * n).toFixed(2);
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function simplifyFraction(num, den) {
  const g = gcd(num, den);
  return [num / g, den / g];
}

function generateProblem(type) {
  let a, b;
  switch (type) {
    case 'int-add':
      a = getRandomInt(10, 99); b = getRandomInt(10, 99);
      return [`${a} + ${b} = ______`, a + b];
    case 'int-sub':
      a = getRandomInt(50, 99); b = getRandomInt(10, a);
      return [`${a} - ${b} = ______`, a - b];
    case 'int-mul':
      a = getRandomInt(2, 12); b = getRandomInt(2, 12);
      return [`${a} × ${b} = ______`, a * b];
    case 'int-div':
      b = getRandomInt(2, 12); a = b * getRandomInt(2, 12);
      return [`${a} ÷ ${b} = ______`, a / b];

    case 'frac-add':
    case 'frac-sub': {
      a = [getRandomInt(1, 9), getRandomInt(2, 10)];
      b = [getRandomInt(1, 9), getRandomInt(2, 10)];
      const lcd = lcm(a[1], b[1]);
      const aScaled = a[0] * (lcd / a[1]);
      const bScaled = b[0] * (lcd / b[1]);
      let resultNum = type === 'frac-add' ? aScaled + bScaled : aScaled - bScaled;
      let [simpNum, simpDen] = simplifyFraction(resultNum, lcd);
      const question = `${a[0]}/${a[1]} ${type === 'frac-add' ? '+' : '-'} ${b[0]}/${b[1]} = ______`;
      return [question, [simpNum, simpDen]];
    }

    case 'frac-mul':
      a = [getRandomInt(1, 9), getRandomInt(2, 10)];
      b = [getRandomInt(1, 9), getRandomInt(2, 10)];
      let [numM, denM] = simplifyFraction(a[0] * b[0], a[1] * b[1]);
      return [`${a[0]}/${a[1]} × ${b[0]}/${b[1]} = ______`, [numM, denM]];

    case 'frac-div':
      a = [getRandomInt(1, 9), getRandomInt(2, 10)];
      b = [getRandomInt(1, 9), getRandomInt(2, 10)];
      let [numD, denD] = simplifyFraction(a[0] * b[1], a[1] * b[0]);
      return [`${a[0]}/${a[1]} ÷ ${b[0]}/${b[1]} = ______`, [numD, denD]];

    case 'dec-add':
      a = toDecimal(10); b = toDecimal(10);
      return [`${a} + ${b} = ______`, (parseFloat(a) + parseFloat(b)).toFixed(2)];
    case 'dec-sub':
      a = toDecimal(10); b = toDecimal(parseFloat(a));
      return [`${a} - ${b} = ______`, (parseFloat(a) - parseFloat(b)).toFixed(2)];
    case 'dec-mul':
      a = toDecimal(10); b = toDecimal(10);
      return [`${a} × ${b} = ______`, (parseFloat(a) * parseFloat(b)).toFixed(2)];
    case 'dec-div':
      b = toDecimal(9) || '1'; a = toDecimal(10);
      return [`${a} ÷ ${b} = ______`, (parseFloat(a) / parseFloat(b)).toFixed(2)];

    default:
      return ['N/A', 'N/A'];
  }
}

function renderFractionLines(num, den) {
  const numStr = `${num}`;
  const denStr = `${den}`;
  const width = Math.max(numStr.length, denStr.length);
  const line = '―'.repeat(width);
  return [numStr.padStart((width + numStr.length) / 2), line, denStr.padStart((width + denStr.length) / 2)];
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const selected = [...document.querySelectorAll('input[name="topics"]:checked')].map(cb => cb.value);

  if (selected.length === 0) {
    alert("Please select at least one topic.");
    return;
  }

  const sections = {
    Integers: selected.filter(t => t.startsWith("int")),
    Fractions: selected.filter(t => t.startsWith("frac")),
    Decimals: selected.filter(t => t.startsWith("dec"))
  };

  let y = 20;
  let problemNumber = 1;
  let answers = [];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Math with Ms. Jean", 105, y, { align: "center" });

  y += 15;
  doc.setFontSize(12);

  for (let section in sections) {
    if (sections[section].length === 0) continue;

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(section, 10, y);
    doc.setFont("courier", "normal");
    y += 5;

    for (let topic of sections[section]) {
      const countInput = document.querySelector(`input[name="count-${topic}"]`);
      const count = countInput ? parseInt(countInput.value) : 1;

      for (let i = 0; i < count; i++) {
        const [question, answer] = generateProblem(topic);
        doc.text(`${problemNumber}. ${question}`, 10, y);
        answers.push({ number: problemNumber, answer });
        y += 10;
        problemNumber++;
      }
    }
    y += 5;
  }

  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Answer Key", 10, 20);
  y = 30;

  doc.setFont("courier", "normal");
  for (let item of answers) {
    if (Array.isArray(item.answer)) {
      const [num, den] = item.answer;
      const lines = renderFractionLines(num, den);
      doc.text(`${item.number}.`, 10, y);
      doc.text(lines[0], 20, y);
      doc.text(lines[1], 20, y + 5);
      doc.text(lines[2], 20, y + 10);
      y += 15;
    } else {
      doc.text(`${item.number}. ${item.answer}`, 10, y);
      y += 10;
    }
  }

  doc.save("worksheet.pdf");

  const history = JSON.parse(localStorage.getItem("worksheetHistory")) || [];
  history.unshift({ date: new Date().toLocaleString(), selected });
  if (history.length > 5) history.pop();
  localStorage.setItem("worksheetHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("worksheetHistory")) || [];

  history.forEach(entry => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<strong>${entry.date}</strong><br/>Topics: ${entry.selected.join(", ")}`;
    historyList.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", renderHistory);

// ----- MODAL PASSCODE LOGIC -----

function showModal() {
  document.getElementById("modal").style.display = "block";
  document.getElementById("digit1").focus();
  clearDigits();
}

function hideModal() {
  document.getElementById("modal").style.display = "none";
  clearDigits();
}

function clearDigits() {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`digit${i}`).value = "";
  }
}

function moveNext(current, nextId) {
  const next = document.getElementById(nextId);
  if (current.value.length === 1 && next) {
    next.focus();
  }
}

function submitIfReady() {
  const code = ['digit1', 'digit2', 'digit3', 'digit4']
    .map(id => document.getElementById(id).value)
    .join('');

  if (code.length === 4) {
    if (code === "9987") {
      localStorage.removeItem("worksheetHistory");
      renderHistory();
      alert("Download history cleared.");
      hideModal();
    } else {
      alert("Incorrect passcode.");
      clearDigits();
      document.getElementById("digit1").focus();
    }
  }
}
window.generatePDF = generatePDF;
