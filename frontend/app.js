// DOM Elements & Helper
const $ = (id) => document.getElementById(id);
const API_URL = '/api';

const jdInput = $('jd-input'), charCounter = $('char-counter'), clearJdBtn = $('clear-jd');
const dropZone = $('drop-zone'), fileInput = $('file-input'), fileInfo = $('file-info');
const filenameDisplay = $('filename-display'), removeFileBtn = $('remove-file');
const analyzeBtn = $('analyze-btn'), downloadReportBtn = $('download-report-btn');
const placeholderState = $('placeholder-state'), loadingState = $('loading-state'), resultsDashboard = $('results-dashboard');
const modal = $('modal-container'), howItWorksBtn = $('how-it-works-btn'), modalCloseBtn = $('modal-close-btn');

let selectedFile = null;

// ========================================================
// 1. INPUT VALIDATION & FILE SELECTION
// ========================================================
const checkValidation = () => {
    analyzeBtn.disabled = !(jdInput.value.trim() && selectedFile);
};

jdInput.addEventListener('input', () => {
    charCounter.textContent = `${jdInput.value.length} / 5000 characters`;
    checkValidation();
});

clearJdBtn.addEventListener('click', () => {
    jdInput.value = '';
    charCounter.textContent = '0 / 5000 characters';
    checkValidation();
});

dropZone.addEventListener('click', () => !selectedFile && fileInput.click());
fileInput.addEventListener('change', (e) => e.target.files[0] && handleFileSelect(e.target.files[0]));

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.toggle('dragover', evt === 'dragenter' || evt === 'dragover');
        if (evt === 'drop' && e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]);
    });
});

function handleFileSelect(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) return alert('Invalid file format. Please upload a PDF or DOCX file.');
    if (file.size > 10 * 1024 * 1024) return alert('File size exceeds 10MB limit.');

    selectedFile = file;
    filenameDisplay.textContent = file.name;
    dropZone.querySelector('.drop-zone-content').style.display = 'none';
    fileInfo.style.display = 'flex';
    checkValidation();
}

removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    dropZone.querySelector('.drop-zone-content').style.display = 'flex';
    fileInfo.style.display = 'none';
    checkValidation();
});

// ========================================================
// 2. API CALL & ANALYZE ACTION
// ========================================================
analyzeBtn.addEventListener('click', async () => {
    if (analyzeBtn.disabled) return;

    placeholderState.style.display = 'none';
    resultsDashboard.style.display = 'none';
    loadingState.style.display = 'flex';
    analyzeBtn.disabled = true;

    const formData = new FormData();
    formData.append('job_description', jdInput.value.trim());
    formData.append('resume', selectedFile);

    try {
        const response = await fetch(`${API_URL}/analyze`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Server status: ${response.status}`);

        const data = await response.json();
        renderDashboard(data);

        loadingState.style.display = 'none';
        resultsDashboard.style.display = 'block';
        downloadReportBtn.disabled = false;
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please verify that your backend server is running and try again.');
        loadingState.style.display = 'none';
        placeholderState.style.display = 'flex';
    } finally {
        checkValidation();
    }
});

// ========================================================
// 3. RENDER DASHBOARD RESULTS
// ========================================================
function renderDashboard(data) {
    const { ats_score: score, resume_summary: res, jd_summary: jd, missing_skills: missing, keywords_analysis: kw, improvement_suggestions: suggestions } = data;

    // A. Match Score & Gauge Circle
    $('score-text').textContent = `${score}%`;
    const gaugeProgress = $('gauge-progress');
    const matchBadge = $('match-badge');
    const scoreDesc = document.querySelector('.score-desc');

    gaugeProgress.setAttribute('stroke-dasharray', `${score}, 100`);
    gaugeProgress.className.baseVal = `circle ${score >= 80 ? 'gauge-high' : score >= 50 ? 'gauge-mid' : 'gauge-low'}`;
    matchBadge.className = `badge ${score >= 80 ? 'badge-success' : score >= 50 ? 'badge-warning' : 'badge-danger'}`;
    matchBadge.textContent = score >= 80 ? 'Great Match!' : score >= 50 ? 'Good Match!' : 'Poor Match!';
    scoreDesc.textContent = score >= 80
        ? 'Your resume has a high match with the job description.'
        : score >= 50 ? 'Your resume matches several key requirements but has gaps.'
            : 'Your resume requires significant updates to match the job.';

    // B. Summaries Mapping
    const setFields = (obj, map) => Object.entries(map).forEach(([key, id]) => $(id).textContent = obj[key] ?? 'N/A');
    setFields(res, { name: 'res-name', email: 'res-email', phone: 'res-phone', experience: 'res-exp', education: 'res-edu', total_skills_found: 'res-skills', projects: 'res-projects' });
    setFields(jd, { job_title: 'jd-title', location: 'jd-location', total_skills: 'jd-skills', experience_required: 'jd-exp', education_required: 'jd-edu', key_responsibilities: 'jd-responsibilities' });

    // C. Missing Skills
    const catMap = { PROGRAMMING: 'skills-programming', GENAI: 'skills-genai', DATABASES: 'skills-databases', ML_DL: 'skills-mldl', CLOUD_DEVOPS: 'skills-clouddevops', TOOLS: 'skills-tools' };
    Object.entries(catMap).forEach(([key, id]) => {
        const ul = $(id);
        const list = missing[key] || [];
        ul.innerHTML = list.length
            ? list.map(s => `<li>${s}</li>`).join('')
            : '<li style="color:var(--text-muted);list-style:none;padding-left:0;">None missing</li>';
    });

    // D. Keywords Analysis & Suggestions
    const renderPills = (containerId, items, type) => {
        const el = $(containerId);
        el.innerHTML = items?.length ? items.map(item => `<span class="pill-badge ${type}">${item}</span>`).join('') : 'None identified';
    };
    renderPills('matched-keywords-container', kw.present, 'success');
    renderPills('missing-keywords-container', kw.missing, 'danger');

    const sugUl = $('suggestions-list');
    sugUl.innerHTML = suggestions?.length ? suggestions.map(s => `<li>${s}</li>`).join('') : '<li>No suggestions; your resume matches all key requirements.</li>';
}

// ========================================================
// 4. UTILITIES & MODAL
// ========================================================
downloadReportBtn.addEventListener('click', () => window.print());

if (howItWorksBtn) howItWorksBtn.addEventListener('click', () => modal.classList.add('active'));
[document.querySelector('.close-modal'), modalCloseBtn].forEach(btn => btn?.addEventListener('click', () => modal.classList.remove('active')));
window.addEventListener('click', (e) => e.target === modal && modal.classList.remove('active'));

