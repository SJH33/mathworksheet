function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toDecimal(n) {
  return (Math.random() * n).toFixed(2);
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
      a = [getRandomInt(1, 9), getRandomInt(2, 10)];
      b = [getRandomInt(1, 9), getRandomInt(2, 10)];
      return [`${a[0]}/${a[1]} + ${b[0]}/${b[1]} = ______`, 'Find common denominator'];
    case 'frac-sub':
      a = [getRandomInt(3, 9), getRandomInt(2, 10)];
      b = [getRandomInt(1, a[0]), a[1]];
      return [`${a[0]}/${a[1]} - ${b[0]}/${b[1]} = ______`, 'Find common denominator'];
    case 'frac-mul':
      a = [getRandomInt(1, 9), getRandomInt(2, 10)];
      b = [getRandomInt(1, 9), getRandomInt(2, 10)];
      return [`${a[0]}/${a[1]} × ${b[0]}/${b[1]} = ______`, `${a[0]*b[0]}/${a[1]*b[1]}`];
    case 'frac-div':
      a = [getRandomInt(1, 9), getRandomInt(2, 10)];
      b = [getRandomInt(1, 9), getRandomInt(2, 10)];
      return [`${a[0]}/${a[1]} ÷ ${b[0]}/${b[1]} = ______`, `${a[0]*b[1]}/${a[1]*b[0]}`];

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

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const selected = [...document.querySelectorAll('input[name="topics"]:checked')].map(cb => cb.value);

  if (selected.length === 0) {
    alert("Please select at least one topic.");
    return;
  }

  let y = 20, answers = [], problemNumber = 1;

  selected.forEach(topic => {
    let countInput = document.querySelector(`input[name="count-${topic}"]`);
    let count = countInput ? parseInt(countInput.value) : 1;

    for (let i = 0; i < count; i++) {
      const [question, answer] = generateProblem(topic);
      doc.setFont("courier", "normal");
      doc.text(`${problemNumber}. ${question}`, 10, y);
      answers.push(`${problemNumber}. ${answer}`);
      y += 10;
      problemNumber++;
    }
  });

  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.text("Answer Key", 10, 20);
  y = 30;
  answers.forEach(answer => {
    doc.setFont("courier", "normal");
    doc.text(answer, 10, y);
    y += 10;
  });

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
