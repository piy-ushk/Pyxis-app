const GEMINI_API_KEY = 'AIzaSyCX-s4eUSP5dQzmXao8RskFT6ZBPNhP9zE';
        
// Initialize Lucide icons
lucide.createIcons();


function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const chatContainer = document.querySelector('.chat-container');
    
    // Create and add pin button
    const pinButton = document.createElement('button');
    pinButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-bar-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"/></svg>';
  

    pinButton.className = 'pin-button';
    sidebar.appendChild(pinButton);

    // Create hover area
    const hoverArea = document.createElement('div');
    hoverArea.className = 'sidebar-hover-area';
    document.body.appendChild(hoverArea);

    let isPinned = false;
    let isHovering = false;

    pinButton.addEventListener('click', function() {
        isPinned = !isPinned;
        sidebar.classList.toggle('pinned', isPinned);
        pinButton.classList.toggle('active', isPinned);
        if (isPinned) {
            sidebar.style.left = '0';
        } else {
            sidebar.style.left = isHovering ? '0' : '-280px';
        }
    });

    // Handle sidebar hover
    function showSidebar() {
        if (!isPinned) {
            isHovering = true;
            sidebar.style.left = '0';
        }
    }

    function hideSidebar() {
        if (!isPinned) {
            isHovering = false;
            sidebar.style.left = '-280px';
        }
    }

    hoverArea.addEventListener('mouseenter', showSidebar);
    sidebar.addEventListener('mouseenter', showSidebar);

    sidebar.addEventListener('mouseleave', hideSidebar);
});
function formatMathContent(text) {
   // Replace common math notations with LaTeX
   let formatted = text
       // Fractions
       .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
       // Powers and superscripts
       .replace(/\^(\d+)/g, '^{$1}')
       // Greek letters
       .replace(/theta/g, '\\theta')
       .replace(/pi/g, '\\pi')
       .replace(/alpha/g, '\\alpha')
       .replace(/beta/g, '\\beta')
       // Trigonometric functions
       .replace(/sin/g, '\\sin')
       .replace(/cos/g, '\\cos')
       .replace(/tan/g, '\\tan')
       .replace(/cot/g, '\\cot')
       // Square roots
       .replace(/sqrt/g, '\\sqrt')
       // Subscripts
       .replace(/_([\w\d]+)/g, '_{$1}');

   return formatted;
}

function createStepHTML(heading, content) {
   heading = heading.replace(/:$/, '');
   
   // Wrap mathematical content in LaTeX delimiters
   const formattedContent = content.map(line => {
       if (line.includes('=') || /[+\-×÷^√∫]/.test(line)) {
           return `$${formatMathContent(line)}$`;
       }
       return line;
   }).join('\n');
   
   return `
       <div class="solution-step">
           <div class="step-heading">${heading}</div>
           <div class="step-content">
               <div class="math-content">${formattedContent}</div>
           </div>
       </div>
   `;
}


function formatSolution(text) {
   // Remove asterisks and other special characters used for emphasis
   let formatted = text.replace(/\*\*/g, '')  // Remove double asterisks
                      .replace(/\*/g, '')     // Remove single asterisks
                      .replace(/\_\_/g, '')   // Remove double underscores
                      .replace(/\_/g, '');    // Remove single underscores

   // Split into lines
   const lines = formatted.split('\n');
   let html = '';
   let currentStep = '';
   let currentContent = [];

   for (let line of lines) {
       line = line.trim();
       if (!line) continue;  // Skip empty lines

       // Check if line looks like a heading (ends with ':' or is in all caps)
       if (line.endsWith(':') || /^[A-Z\s]{4,}$/.test(line)) {
           // If we have a previous step, add it to html
           if (currentStep) {
               html += createStepHTML(currentStep, currentContent);
               currentContent = [];
           }
           currentStep = line;
       } else {
           currentContent.push(line);
       }
   }

   // Add the last step
   if (currentStep) {
       html += createStepHTML(currentStep, currentContent);
   }

   return html;
}

function createStepHTML(heading, content) {
   // Remove trailing colon from heading if present
   heading = heading.replace(/:$/, '');
   
   return `
       <div class="solution-step">
           <div class="step-heading">${heading}</div>
           <div class="step-content">
               <pre>${content.join('\n')}</pre>
           </div>
       </div>
   `;
}

async function solveMathProblem() {
   const question = document.getElementById('question').value.trim();
   const loadingEl = document.getElementById('loading');
   const errorEl = document.getElementById('error');
   const solutionEl = document.getElementById('solution');

   if (!question) {
       alert('Please enter a question');
       return;
   }

   loadingEl.style.display = 'block';

   solutionEl.textContent = '';

   try {
       // First try to solve with math.js
       const mathJsSolution = await solveWithMathJs(question);
       
       if (mathJsSolution) {
           solutionEl.innerHTML = formatSolution(mathJsSolution);
       } else {
           // If math.js can't handle it, use Gemini for word problems
           const geminiResult = await solveWithGemini(question);
           solutionEl.innerHTML = formatSolution(geminiResult);
       }
   } catch (error) {
       console.error('Error:', error);
       errorEl.style.display = 'block';
   } finally {
       loadingEl.style.display = 'none';
   }
}

function solveWithMathJs(question) {
   try {
       let solution = '';
       
       // Check if it's an equation to solve
       if (question.includes('=')) {
           const sides = question.split('=');
           if (sides.length === 2) {
               const equation = math.parse(sides[0]).subtract(math.parse(sides[1]));
               const variables = math.variables(equation);
               
               if (variables.length > 0) {
                   const variable = variables[0];
                   const solutions = math.solve(equation, variable);
                   solution = 'Original Equation:\n';
                   solution += `${question}\n\n`;
                   solution += 'Step-by-Step Solution:\n';
                   solution += `1. Rearrange the equation to standard form\n`;
                   solution += `${equation.toString()} = 0\n\n`;
                   solution += 'Final Answer:\n';
                   solutions.forEach((sol, index) => {
                       solution += `${variable} = ${math.format(sol, {precision: 14})}\n`;
                   });
               }
           }
       }
       // Check if it's a derivative
       else if (question.toLowerCase().includes('derivative')) {
           const expr = question.toLowerCase().replace('derivative of', '').trim();
           const derivative = math.derivative(expr, 'x');
           solution = 'Original Expression:\n';
           solution += `${expr}\n\n`;
           solution += 'Derivative Process:\n';
           solution += `Applying differentiation rules\n\n`;
           solution += 'Final Result:\n';
           solution += `${derivative.toString()}`;
       }
       // Otherwise try to evaluate the expression
       else {
           const result = math.evaluate(question);
           solution = 'Expression to Evaluate:\n';
           solution += `${question}\n\n`;
           solution += 'Calculation:\n';
           solution += `Direct computation\n\n`;
           solution += 'Final Result:\n';
           solution += `${math.format(result, {precision: 14})}`;
       }

       return solution || null;
   } catch (error) {
       console.error('Math.js Error:', error);
       return null;
   }
}

async function solveWithGemini(question) {
   const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
   
   const payload = {
       contents: [{
           parts: [{
               text: `Solve this math problem step by step. Format your response with clear headings for each step, showing all work clearly. Question: ${question}`
           }]
       }]
   };

   try {
       const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify(payload)
       });

       const data = await response.json();
       return data.candidates[0].content.parts[0].text;
   } catch (error) {
       console.error('Gemini API Error:', error);
       throw error;
   }
}

let display = document.getElementById('display');
let cursorPosition = 0;

function addToDisplay(value) {
    let text = display.value;
    let before = text.slice(0, display.selectionStart);
    let after = text.slice(display.selectionStart);
    display.value = before + value + after;
    display.selectionStart = display.selectionEnd = before.length + value.length;
    display.focus();
}

function clearDisplay() {
    display.value = '';
    display.focus();
}

function clearLastChar() {
    let text = display.value;
    let pos = display.selectionStart;
    if (pos > 0) {
        display.value = text.slice(0, pos - 1) + text.slice(pos);
        display.selectionStart = display.selectionEnd = pos - 1;
    }
    display.focus();
}

function deleteChar() {
    let text = display.value;
    let pos = display.selectionStart;
    display.value = text.slice(0, pos) + text.slice(pos + 1);
    display.selectionStart = display.selectionEnd = pos;
    display.focus();
}

function moveLeft() {
    let pos = display.selectionStart;
    if (pos > 0) {
        display.selectionStart = display.selectionEnd = pos - 1;
    }
    display.focus();
}

function moveRight() {
    let pos = display.selectionStart;
    if (pos < display.value.length) {
        display.selectionStart = display.selectionEnd = pos + 1;
    }
    display.focus();
}


        // Handle keyboard input
        display.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                solve();
            }
        });
