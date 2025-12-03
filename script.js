document.addEventListener('DOMContentLoaded', () => {
    renderCalculationChain();
});

// --- RENDER GIAO DIỆN ---
function renderCalculationChain() {
    const count = parseInt(document.getElementById('matrixCount').value);
    const container = document.getElementById('calculation-chain');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const label = String.fromCharCode(65 + i); // A, B, C...
        const matrixId = `matrix-${i}`;

        // HTML cho khối Ma trận
        const matrixHtml = `
            <div class="matrix-box" id="box-${matrixId}">
                <div class="matrix-header">
                    <h3>Ma trận ${label}</h3>
                    <div class="dim-inputs">
                        <input type="number" id="${matrixId}-rows" value="2" min="1" max="10" onchange="updateGrid('${matrixId}')">
                        <span>x</span>
                        <input type="number" id="${matrixId}-cols" value="2" min="1" max="10" onchange="updateGrid('${matrixId}')">
                    </div>
                </div>
                <div id="${matrixId}-grid" class="matrix-grid"></div>
                
                <div class="matrix-tools">
                    <button class="tool-btn" onclick="transposeMatrix('${matrixId}')" title="Chuyển vị dòng thành cột">Chuyển vị</button>
                    <button class="tool-btn" onclick="inverseMatrix('${matrixId}')" title="Nghịch đảo ma trận vuông">Nghịch đảo</button>
                    <button class="tool-btn" onclick="fillZero('${matrixId}')" title="Xóa trắng dữ liệu">Xóa</button>
                    <button class="tool-btn" onclick="fillRandom('${matrixId}')" title="Điền số ngẫu nhiên">Ngẫu nhiên</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', matrixHtml);
        updateGrid(matrixId);

        // HTML cho khối Phép tính (nằm giữa các ma trận)
        if (i < count - 1) {
            const operatorHtml = `
                <div class="operator-box">
                    <select class="operator-select" id="op-${i}" title="Chọn phép tính">
                        <option value="multiply">×</option>
                        <option value="add">+</option>
                        <option value="subtract">-</option>
                    </select>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', operatorHtml);
        }
    }
}

// Cập nhật lưới ô nhập liệu (Input trống, placeholder=0)
function updateGrid(matrixId) {
    const rows = parseInt(document.getElementById(`${matrixId}-rows`).value);
    const cols = parseInt(document.getElementById(`${matrixId}-cols`).value);
    const grid = document.getElementById(`${matrixId}-grid`);
    
    // Lưu giá trị cũ
    const oldInputs = grid.querySelectorAll('input');
    const oldValues = Array.from(oldInputs).map(inp => inp.value);

    // FIX: Dùng 55px kích thước cố định
    grid.style.gridTemplateColumns = `repeat(${cols}, 55px)`;
    grid.innerHTML = '';

    for (let i = 0; i < rows * cols; i++) {
        const val = oldValues[i] !== undefined ? oldValues[i] : ""; 
        const input = document.createElement('input');
        input.type = "number";
        input.className = "matrix-cell";
        input.value = val;
        input.placeholder = "0";
        // Gắn sự kiện điều hướng mũi tên
        input.onkeydown = (e) => handleArrowNavigation(e, i, rows, cols, grid);
        grid.appendChild(input);
    }
}

// --- NÂNG CẤP: ĐIỀU HƯỚNG BẰNG MŨI TÊN ---
function handleArrowNavigation(e, index, rows, cols, grid) {
    const inputs = grid.querySelectorAll('input');
    let nextIndex = index;

    if (e.key === "ArrowRight") nextIndex = index + 1;
    else if (e.key === "ArrowLeft") nextIndex = index - 1;
    else if (e.key === "ArrowDown") nextIndex = index + cols;
    else if (e.key === "ArrowUp") nextIndex = index - cols;
    else return; // Không phải phím mũi tên thì thoát

    if (nextIndex >= 0 && nextIndex < inputs.length) {
        e.preventDefault(); // Ngăn cuộn trang
        inputs[nextIndex].focus();
        inputs[nextIndex].select(); // Bôi đen giá trị để nhập nhanh
    }
}

// --- LOGIC TOÁN HỌC ---
function getMatrixData(matrixId) {
    const rows = parseInt(document.getElementById(`${matrixId}-rows`).value);
    const cols = parseInt(document.getElementById(`${matrixId}-cols`).value);
    const inputs = document.getElementById(`${matrixId}-grid`).querySelectorAll('input');
    
    let data = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            let valStr = inputs[r * cols + c].value;
            let val = valStr === "" ? 0 : parseFloat(valStr);
            row.push(val);
        }
        data.push(row);
    }
    return data;
}

function setMatrixData(matrixId, data) {
    const rows = data.length;
    const cols = data[0].length;
    
    document.getElementById(`${matrixId}-rows`).value = rows;
    document.getElementById(`${matrixId}-cols`).value = cols;
    
    const grid = document.getElementById(`${matrixId}-grid`);
    grid.style.gridTemplateColumns = `repeat(${cols}, 55px)`;
    grid.innerHTML = '';
    
    // Khi set dữ liệu từ tính toán (VD: chuyển vị), cần render lại ô input
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const val = data[r][c];
            const displayVal = Number.isInteger(val) ? val : val.toFixed(4);
            const input = document.createElement('input');
            input.type = "number";
            input.className = "matrix-cell";
            input.value = displayVal;
            input.placeholder = "0";
            // Gắn lại sự kiện mũi tên cho ô mới
            let index = r * cols + c;
            input.onkeydown = (e) => handleArrowNavigation(e, index, rows, cols, grid);
            grid.appendChild(input);
        }
    }
}

// Các hàm tính toán cơ bản (Core Math)
function addMatrices(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) throw "Lỗi Cộng: Kích thước không khớp!";
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}
function subtractMatrices(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) throw "Lỗi Trừ: Kích thước không khớp!";
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}
function multiplyMatrices(A, B) {
    const r1 = A.length, c1 = A[0].length;
    const r2 = B.length, c2 = B[0].length;
    if (c1 !== r2) throw `Lỗi Nhân: Cột trước (${c1}) khác Dòng sau (${r2})!`;
    
    let result = new Array(r1).fill(0).map(() => new Array(c2).fill(0));
    for (let i = 0; i < r1; i++) {
        for (let j = 0; j < c2; j++) {
            for (let k = 0; k < c1; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}
function transpose(M) { return M[0].map((_, c) => M.map(r => r[c])); }
function invert(M) {
    if (M.length !== M[0].length) throw "Phải là ma trận vuông mới nghịch đảo được!";
    let n = M.length;
    let A = JSON.parse(JSON.stringify(M));
    let I = [];
    for(let i=0; i<n; i++){ I[i]=[]; for(let j=0; j<n; j++) I[i][j] = (i==j)?1:0; }
    for(let i=0; i<n; i++){
        let pivot = A[i][i];
        if(Math.abs(pivot) < 1e-9) throw "Định thức = 0, không có nghịch đảo!";
        for(let j=0; j<n; j++){ A[i][j]/=pivot; I[i][j]/=pivot; }
        for(let k=0; k<n; k++){
            if(k!=i){
                let f = A[k][i];
                for(let j=0; j<n; j++){ A[k][j]-=f*A[i][j]; I[k][j]-=f*I[i][j]; }
            }
        }
    }
    return I;
}

// Wrapper Functions
function transposeMatrix(id) { setMatrixData(id, transpose(getMatrixData(id))); }
function inverseMatrix(id) { try{setMatrixData(id, invert(getMatrixData(id)));}catch(e){alert(e);} }
function fillRandom(id) {
    const r = parseInt(document.getElementById(`${id}-rows`).value);
    const c = parseInt(document.getElementById(`${id}-cols`).value);
    const d = Array(r).fill().map(() => Array(c).fill(0).map(() => Math.floor(Math.random()*10)));
    setMatrixData(id, d);
}
// Thêm hàm xóa trắng (Reset 0)
function fillZero(id) {
    const r = parseInt(document.getElementById(`${id}-rows`).value);
    const c = parseInt(document.getElementById(`${id}-cols`).value);
    // Tạo mảng rỗng để ô input hiện placeholder "0"
    const grid = document.getElementById(`${id}-grid`);
    grid.innerHTML = '';
    for(let i=0; i<r*c; i++) {
        const input = document.createElement('input');
        input.type = "number";
        input.className = "matrix-cell";
        input.value = ""; // Giá trị rỗng
        input.placeholder = "0";
        input.onkeydown = (e) => handleArrowNavigation(e, i, r, c, grid);
        grid.appendChild(input);
    }
}

// --- QUY TRÌNH TÍNH TOÁN CHÍNH ---
let pendingResult = null;
let historyStr = "";

function processCalculation() {
    const errorBox = document.getElementById('error-box');
    errorBox.classList.add('hidden');
    
    try {
        const count = parseInt(document.getElementById('matrixCount').value);
        let matrices = [];
        let ops = [];
        let labels = [];

        // Thu thập dữ liệu
        for(let i=0; i<count; i++) {
            matrices.push(getMatrixData(`matrix-${i}`));
            labels.push(String.fromCharCode(65 + i));
        }
        for(let i=0; i<count-1; i++) {
            ops.push(document.getElementById(`op-${i}`).value);
        }

        // Tạo chuỗi biểu thức lịch sử
        historyStr = "";
        for(let i=0; i<count; i++) {
            let dims = `(${matrices[i].length}x${matrices[i][0].length})`;
            historyStr += `<b>${labels[i]}</b><small>${dims}</small>`;
            if(i < count - 1) {
                let sym = ops[i] === 'multiply' ? ' × ' : (ops[i] === 'add' ? ' + ' : ' - ');
                historyStr += `<span style="color:#ffd700">${sym}</span>`;
            }
        }

        // Bước 1: Nhân trước
        let i = 0;
        while(i < ops.length) {
            if(ops[i] === 'multiply') {
                let res = multiplyMatrices(matrices[i], matrices[i+1]);
                matrices.splice(i, 2, res);
                ops.splice(i, 1);
            } else {
                i++;
            }
        }

        // Bước 2: Cộng/Trừ sau
        let result = matrices[0];
        for(let j=0; j<ops.length; j++) {
            if(ops[j] === 'add') result = addMatrices(result, matrices[j+1]);
            else if(ops[j] === 'subtract') result = subtractMatrices(result, matrices[j+1]);
        }

        pendingResult = result;
        document.getElementById('paywall-modal').classList.remove('hidden');

    } catch (e) {
        errorBox.innerHTML = `⚠️ ${e}`;
        errorBox.classList.remove('hidden');
    }
}

function verifyCode() {
    const code = document.getElementById('coupon-code').value;
    if (code === '#PTMA') {
        document.getElementById('paywall-modal').classList.add('hidden');
        showResult(pendingResult);
        addToHistory(historyStr);
    } else {
        alert("Mã sai! Không làm mà đòi có ăn");
    }
}

function showResult(data) {
    const area = document.getElementById('result-area');
    const grid = document.getElementById('result-matrix');
    const title = area.querySelector('h2'); 
    
    area.classList.remove('hidden');
    area.scrollIntoView({behavior: "smooth"});
    
    const rows = data.length;
    const cols = data[0].length;

    // Hiển thị kích thước
    title.innerHTML = `<i class='bx bx-check-double'></i> Final Answer (${rows}x${cols}):`;

    // Grid kết quả (55px cứng)
    grid.style.gridTemplateColumns = `repeat(${cols}, 55px)`;
    grid.innerHTML = '';
    
    data.forEach(row => {
        row.forEach(val => {
            const displayVal = Number.isInteger(val) ? val : val.toFixed(4);
            grid.innerHTML += `<input type="number" class="matrix-cell" value="${displayVal}" readonly>`;
        });
    });
}

function addToHistory(expr) {
    const time = new Date().toLocaleTimeString();
    const list = document.getElementById('history-list');
    const li = document.createElement('li');
    li.innerHTML = `<span style="color:#aaa; font-size:12px">${time}</span>: ${expr}`;
    list.insertBefore(li, list.firstChild);
}