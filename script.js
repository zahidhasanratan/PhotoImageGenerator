// Canvas and context
const canvas = document.getElementById('certificateCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions (will be adjusted based on background image)
let CANVAS_WIDTH = 1200;
let CANVAS_HEIGHT = 1200;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// State
let uploadedPhoto = null;
let photoImage = null;
let uploadedBackground = null;
let backgroundImage = null;
let dragMode = false;
let draggingText = null;
let dragOffset = { x: 0, y: 0 };
let photoDragMode = false;
let draggingPhoto = false;
let resizingPhoto = false;
let photoDragOffset = { x: 0, y: 0 };
let photoResizeStart = { x: 0, y: 0, size: 0 };
let mousePos = { x: 0, y: 0 };
let hoverPhoto = false;

// DOM Elements
const backgroundInput = document.getElementById('backgroundInput');
const backgroundUploadArea = document.getElementById('backgroundUploadArea');
const backgroundPreview = document.getElementById('backgroundPreview');
const photoInput = document.getElementById('photoInput');
const uploadArea = document.getElementById('uploadArea');
const photoPreview = document.getElementById('photoPreview');
const participantName = document.getElementById('participantName');
const participantClass = document.getElementById('participantClass');
const schoolName = document.getElementById('schoolName');
const mottoText = document.getElementById('mottoText');
const photoSize = document.getElementById('photoSize');
const photoSizeValue = document.getElementById('photoSizeValue');
const photoPositionX = document.getElementById('photoPositionX');
const photoPositionXValue = document.getElementById('photoPositionXValue');
const photoPositionY = document.getElementById('photoPositionY');
const photoPositionYValue = document.getElementById('photoPositionYValue');
const photoBorderEnabled = document.getElementById('photoBorderEnabled');
const photoBorderColor = document.getElementById('photoBorderColor');
const photoBorderWidth = document.getElementById('photoBorderWidth');
const photoBorderWidthValue = document.getElementById('photoBorderWidthValue');
const textPositionX = document.getElementById('textPositionX');
const textPositionXValue = document.getElementById('textPositionXValue');
const textPositionY = document.getElementById('textPositionY');
const textPositionYValue = document.getElementById('textPositionYValue');
const toggleDragBtn = document.getElementById('toggleDragBtn');
const nameFontSize = document.getElementById('nameFontSize');
const nameFontSizeValue = document.getElementById('nameFontSizeValue');
const nameColor = document.getElementById('nameColor');
const nameGap = document.getElementById('nameGap');
const nameGapValue = document.getElementById('nameGapValue');
const classFontSize = document.getElementById('classFontSize');
const classFontSizeValue = document.getElementById('classFontSizeValue');
const classColor = document.getElementById('classColor');
const classGap = document.getElementById('classGap');
const classGapValue = document.getElementById('classGapValue');
const schoolFontSize = document.getElementById('schoolFontSize');
const schoolFontSizeValue = document.getElementById('schoolFontSizeValue');
const schoolColor = document.getElementById('schoolColor');
const schoolGap = document.getElementById('schoolGap');
const schoolGapValue = document.getElementById('schoolGapValue');
const mottoFontSize = document.getElementById('mottoFontSize');
const mottoFontSizeValue = document.getElementById('mottoFontSizeValue');
const mottoColor = document.getElementById('mottoColor');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const loadSettingsBtn = document.getElementById('loadSettingsBtn');
const exportSettingsBtn = document.getElementById('exportSettingsBtn');
const importSettingsBtn = document.getElementById('importSettingsBtn');
const importSettingsInput = document.getElementById('importSettingsInput');

// Initialize
init();

function init() {
    // Background upload area handlers
    backgroundUploadArea.addEventListener('click', () => backgroundInput.click());
    backgroundUploadArea.addEventListener('dragover', (e) => handleDragOver(e, backgroundUploadArea));
    backgroundUploadArea.addEventListener('drop', (e) => handleDrop(e, backgroundInput));
    backgroundUploadArea.addEventListener('dragleave', (e) => handleDragLeave(e, backgroundUploadArea));
    backgroundInput.addEventListener('change', (e) => handleFileSelect(e, 'background'));
    
    // Student photo upload area handlers
    uploadArea.addEventListener('click', () => photoInput.click());
    uploadArea.addEventListener('dragover', (e) => handleDragOver(e, uploadArea));
    uploadArea.addEventListener('drop', (e) => handleDrop(e, photoInput));
    uploadArea.addEventListener('dragleave', (e) => handleDragLeave(e, uploadArea));
    photoInput.addEventListener('change', (e) => handleFileSelect(e, 'photo'));
    
    // Input change handlers for real-time updates
    [participantName, participantClass, schoolName, mottoText, 
     photoSize, photoPositionX, photoPositionY, textPositionX, textPositionY,
     nameFontSize, nameColor, nameGap, classFontSize, classColor, classGap,
     schoolFontSize, schoolColor, schoolGap, mottoFontSize, mottoColor,
     photoBorderColor, photoBorderEnabled].forEach(input => {
        input.addEventListener('input', updatePreview);
        if (input.type === 'checkbox') {
            input.addEventListener('change', updatePreview);
        }
    });
    
    // Border width handler
    photoBorderWidth.addEventListener('input', () => {
        photoBorderWidthValue.textContent = photoBorderWidth.value + 'px';
        updatePreview();
    });
    
    // Toggle drag mode
    toggleDragBtn.addEventListener('click', toggleDragMode);
    
    // Canvas drag handlers
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    
    // Button handlers
    downloadBtn.addEventListener('click', downloadCertificate);
    resetBtn.addEventListener('click', resetForm);
    saveSettingsBtn.addEventListener('click', saveSettings);
    loadSettingsBtn.addEventListener('click', loadSettings);
    exportSettingsBtn.addEventListener('click', exportSettings);
    importSettingsBtn.addEventListener('click', () => importSettingsInput.click());
    importSettingsInput.addEventListener('change', importSettings);
    
    // Auto-load settings on page load
    autoLoadSettings();
    
    // Update range value displays
    photoSize.addEventListener('input', () => {
        photoSizeValue.textContent = photoSize.value + '%';
        updatePreview();
    });
    
    photoPositionX.addEventListener('input', () => {
        photoPositionXValue.textContent = photoPositionX.value + '%';
        updatePreview();
    });
    
    photoPositionY.addEventListener('input', () => {
        photoPositionYValue.textContent = photoPositionY.value + '%';
        updatePreview();
    });
    
    textPositionX.addEventListener('input', () => {
        textPositionXValue.textContent = textPositionX.value + '%';
        updatePreview();
    });
    
    textPositionY.addEventListener('input', () => {
        textPositionYValue.textContent = textPositionY.value + '%';
        updatePreview();
    });
    
    // Font size value displays
    nameFontSize.addEventListener('input', () => {
        nameFontSizeValue.textContent = nameFontSize.value + 'px';
        updatePreview();
    });
    
    classFontSize.addEventListener('input', () => {
        classFontSizeValue.textContent = classFontSize.value + 'px';
        updatePreview();
    });
    
    schoolFontSize.addEventListener('input', () => {
        schoolFontSizeValue.textContent = schoolFontSize.value + 'px';
        updatePreview();
    });
    
    mottoFontSize.addEventListener('input', () => {
        mottoFontSizeValue.textContent = mottoFontSize.value + 'px';
        updatePreview();
    });
    
    // Gap value displays
    nameGap.addEventListener('input', () => {
        nameGapValue.textContent = nameGap.value + 'px';
        updatePreview();
    });
    
    classGap.addEventListener('input', () => {
        classGapValue.textContent = classGap.value + 'px';
        updatePreview();
    });
    
    schoolGap.addEventListener('input', () => {
        schoolGapValue.textContent = schoolGap.value + 'px';
        updatePreview();
    });
    
    // Initial render
    generateCertificate();
}

function handleDragOver(e, area) {
    e.preventDefault();
    area.style.borderColor = '#f4e4bc';
    area.style.background = 'rgba(255, 255, 255, 0.15)';
}

function handleDragLeave(e, area) {
    e.preventDefault();
    area.style.borderColor = '#d4af37';
    area.style.background = 'rgba(255, 255, 255, 0.05)';
}

function handleDrop(e, input) {
    e.preventDefault();
    const area = input.id === 'backgroundInput' ? backgroundUploadArea : uploadArea;
    handleDragLeave(e, area);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        if (input.id === 'backgroundInput') {
            loadBackgroundImage(files[0]);
        } else {
            loadStudentPhoto(files[0]);
        }
    }
}

function handleFileSelect(e, type) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        if (type === 'background') {
            loadBackgroundImage(file);
        } else {
            loadStudentPhoto(file);
        }
    }
}

function loadBackgroundImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedBackground = e.target.result;
        const img = new Image();
        img.onload = () => {
            backgroundImage = img;
            // Adjust canvas to match background image dimensions
            CANVAS_WIDTH = img.width;
            CANVAS_HEIGHT = img.height;
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            
            // Update preview thumbnail
            backgroundPreview.src = uploadedBackground;
            backgroundPreview.style.display = 'block';
            backgroundUploadArea.querySelector('.upload-placeholder').style.display = 'none';
            
            // Immediately draw the background in preview
            generateCertificate();
        };
        img.onerror = () => {
            alert('Error loading background image. Please try another image.');
        };
        img.src = uploadedBackground;
    };
    reader.readAsDataURL(file);
}

function loadStudentPhoto(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedPhoto = e.target.result;
        const img = new Image();
        img.onload = () => {
            photoImage = img;
            photoPreview.src = uploadedPhoto;
            photoPreview.style.display = 'block';
            uploadArea.querySelector('.upload-placeholder').style.display = 'none';
            updatePreview();
        };
        img.onerror = () => {
            alert('Error loading student photo. Please try another image.');
        };
        img.src = uploadedPhoto;
    };
    reader.readAsDataURL(file);
}

function updatePreview() {
    generateCertificate();
}

function generateCertificate() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background image if uploaded, otherwise show blank white canvas
    if (backgroundImage) {
        // Draw the background image to fill the entire canvas
        ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw student photo if uploaded
        if (photoImage) {
            drawParticipantPhoto();
        }
        
        // Draw text elements
        drawTextElements();
    } else {
        // Show blank white canvas when no background is uploaded
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Still draw photo if uploaded (for preview)
        if (photoImage) {
            drawParticipantPhoto();
        }
    }
    
    // Enable download button only if background is uploaded
    downloadBtn.disabled = !backgroundImage;
}

function drawGradientBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a1929'); // Dark blue
    gradient.addColorStop(0.3, '#1a365d'); // Medium blue
    gradient.addColorStop(0.6, '#2d5a7f'); // Teal
    gradient.addColorStop(1, '#2d8659'); // Emerald green
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawDecorativeElements() {
    // Gold wave shape in upper right
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH * 0.7, 0);
    ctx.bezierCurveTo(
        CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.1,
        CANVAS_WIDTH * 0.85, CANVAS_HEIGHT * 0.3,
        CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.4
    );
    ctx.bezierCurveTo(
        CANVAS_WIDTH * 0.65, CANVAS_HEIGHT * 0.5,
        CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.45,
        CANVAS_WIDTH * 0.4, CANVAS_HEIGHT * 0.35
    );
    ctx.closePath();
    
    const goldGradient = ctx.createLinearGradient(
        CANVAS_WIDTH * 0.4, 0,
        CANVAS_WIDTH * 0.9, CANVAS_HEIGHT * 0.5
    );
    goldGradient.addColorStop(0, '#f4e4bc');
    goldGradient.addColorStop(0.5, '#d4af37');
    goldGradient.addColorStop(1, '#b8941f');
    
    ctx.fillStyle = goldGradient;
    ctx.fill();
    ctx.restore();
    
    // Decorative dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const dotSize = 8;
    
    // Top right dots
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH * 0.85 + i * 15, 30, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH * 0.85 + i * 15, 60, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPhotoPlaceholder() {
    const sizePercent = parseInt(photoSize.value) / 100;
    const photoSize_px = (Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.23) * sizePercent;
    const centerX = CANVAS_WIDTH * parseInt(photoPositionX.value) / 100;
    const centerY = CANVAS_HEIGHT * parseInt(photoPositionY.value) / 100;
    const radius = photoSize_px / 2;
    
    // Draw placeholder circle with checkered pattern
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Checkered pattern
    const checkSize = 20;
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(centerX - radius, centerY - radius, photoSize_px, photoSize_px);
    
    ctx.fillStyle = '#f0f0f0';
    for (let y = 0; y < photoSize_px; y += checkSize) {
        for (let x = 0; x < photoSize_px; x += checkSize) {
            if ((x / checkSize + y / checkSize) % 2 === 0) {
                ctx.fillRect(centerX - radius + x, centerY - radius + y, checkSize, checkSize);
            }
        }
    }
    
    ctx.restore();
    
    // Draw gold border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw upload icon
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold ' + (photoSize_px * 0.15) + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷', centerX, centerY);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawParticipantPhoto() {
    const sizePercent = parseInt(photoSize.value) / 100;
    const photoSize_px = (Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.23) * sizePercent;
    const centerX = CANVAS_WIDTH * parseInt(photoPositionX.value) / 100;
    const centerY = CANVAS_HEIGHT * parseInt(photoPositionY.value) / 100;
    const radius = photoSize_px / 2;
    
    // Calculate source dimensions for square crop (centered)
    const imgAspect = photoImage.width / photoImage.height;
    let sourceWidth, sourceHeight, sourceX, sourceY;
    
    if (imgAspect > 1) {
        // Image is wider than tall
        sourceHeight = photoImage.height;
        sourceWidth = photoImage.height;
        sourceX = (photoImage.width - sourceWidth) / 2;
        sourceY = 0;
    } else {
        // Image is taller than wide
        sourceWidth = photoImage.width;
        sourceHeight = photoImage.width;
        sourceX = 0;
        sourceY = (photoImage.height - sourceHeight) / 2;
    }
    
    // Draw circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw image with proper cropping
    ctx.drawImage(
        photoImage,
        sourceX, sourceY, sourceWidth, sourceHeight,
        centerX - radius, centerY - radius, photoSize_px, photoSize_px
    );
    ctx.restore();
    
    // Draw border if enabled
    if (photoBorderEnabled.checked) {
        const borderWidth = parseInt(photoBorderWidth.value);
        if (borderWidth > 0) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.strokeStyle = photoBorderColor.value;
            ctx.lineWidth = borderWidth;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }
    
    // Draw resize handle if photo is hovered, selected, or being dragged/resized
    if (hoverPhoto || photoDragMode || draggingPhoto || resizingPhoto) {
        const handleX = centerX + radius * 0.7;
        const handleY = centerY + radius * 0.7;
        const handleSize = 15;
        
        // Draw handle circle
        ctx.fillStyle = '#d4af37';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(handleX, handleY, handleSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw resize icon (corner lines)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Top-left to bottom-right corner lines
        ctx.moveTo(handleX - handleSize * 0.5, handleY - handleSize * 0.3);
        ctx.lineTo(handleX - handleSize * 0.3, handleY - handleSize * 0.5);
        ctx.moveTo(handleX + handleSize * 0.3, handleY + handleSize * 0.5);
        ctx.lineTo(handleX + handleSize * 0.5, handleY + handleSize * 0.3);
        ctx.stroke();
    }
}

function drawTextElements() {
    const textX = CANVAS_WIDTH * parseInt(textPositionX.value) / 100;
    let currentY = CANVAS_HEIGHT * parseInt(textPositionY.value) / 100;
    
    // Set shadow for text
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Participant name - only draw if value exists
    if (participantName.value && participantName.value.trim() !== '') {
        const nameSize = parseInt(nameFontSize.value);
        ctx.fillStyle = nameColor.value;
        ctx.font = 'bold ' + nameSize + 'px Arial, sans-serif';
        ctx.fillText(participantName.value.trim(), textX, currentY);
        currentY += parseInt(nameGap.value);
    }
    
    // Class - only draw if value exists
    if (participantClass.value && participantClass.value.trim() !== '') {
        const classSize = parseInt(classFontSize.value);
        ctx.fillStyle = classColor.value;
        ctx.font = classSize + 'px Arial, sans-serif';
        ctx.fillText(participantClass.value.trim(), textX, currentY);
        currentY += parseInt(classGap.value);
    }
    
    // School name - only draw if value exists
    if (schoolName.value && schoolName.value.trim() !== '') {
        const schoolSize = parseInt(schoolFontSize.value);
        ctx.fillStyle = schoolColor.value;
        ctx.font = schoolSize + 'px Arial, sans-serif';
        ctx.fillText(schoolName.value.trim(), textX, currentY);
        currentY += parseInt(schoolGap.value);
    }
    
    // Motto - only draw if value exists
    if (mottoText.value && mottoText.value.trim() !== '') {
        const mottoSize = parseInt(mottoFontSize.value);
        ctx.fillStyle = mottoColor.value;
        ctx.font = 'bold ' + mottoSize + 'px Arial, sans-serif';
        ctx.fillText(mottoText.value.trim(), textX, currentY);
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw drag indicators if drag mode is enabled
    if (dragMode) {
        drawDragIndicators(textX, currentY);
    }
}

function drawDragIndicators(textX, lastY) {
    const startY = CANVAS_HEIGHT * parseInt(textPositionY.value) / 100;
    let widths = [];
    let y = startY;
    
    // Calculate widths for existing text elements
    if (participantName.value && participantName.value.trim() !== '') {
        const nameSize = parseInt(nameFontSize.value);
        ctx.font = 'bold ' + nameSize + 'px Arial, sans-serif';
        widths.push(ctx.measureText(participantName.value.trim()).width);
    }
    
    if (participantClass.value && participantClass.value.trim() !== '') {
        const classSize = parseInt(classFontSize.value);
        ctx.font = classSize + 'px Arial, sans-serif';
        widths.push(ctx.measureText(participantClass.value.trim()).width);
    }
    
    if (schoolName.value && schoolName.value.trim() !== '') {
        const schoolSize = parseInt(schoolFontSize.value);
        ctx.font = schoolSize + 'px Arial, sans-serif';
        widths.push(ctx.measureText(schoolName.value.trim()).width);
    }
    
    if (mottoText.value && mottoText.value.trim() !== '') {
        const mottoSize = parseInt(mottoFontSize.value);
        ctx.font = 'bold ' + mottoSize + 'px Arial, sans-serif';
        widths.push(ctx.measureText(mottoText.value.trim()).width);
    }
    
    if (widths.length === 0) return;
    
    const maxWidth = Math.max(...widths) + 20;
    
    // Draw bounding boxes for each text element
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Name box
    if (participantName.value && participantName.value.trim() !== '') {
        const nameSize = parseInt(nameFontSize.value);
        ctx.fillRect(textX - 10, y - nameSize - 5, maxWidth, nameSize + 10);
        ctx.strokeRect(textX - 10, y - nameSize - 5, maxWidth, nameSize + 10);
        y += parseInt(nameGap.value);
    }
    
    // Class box
    if (participantClass.value && participantClass.value.trim() !== '') {
        const classSize = parseInt(classFontSize.value);
        ctx.fillRect(textX - 10, y - classSize - 5, maxWidth, classSize + 10);
        ctx.strokeRect(textX - 10, y - classSize - 5, maxWidth, classSize + 10);
        y += parseInt(classGap.value);
    }
    
    // School box
    if (schoolName.value && schoolName.value.trim() !== '') {
        const schoolSize = parseInt(schoolFontSize.value);
        ctx.fillRect(textX - 10, y - schoolSize - 5, maxWidth, schoolSize + 10);
        ctx.strokeRect(textX - 10, y - schoolSize - 5, maxWidth, schoolSize + 10);
        y += parseInt(schoolGap.value);
    }
    
    // Motto box
    if (mottoText.value && mottoText.value.trim() !== '') {
        const mottoSize = parseInt(mottoFontSize.value);
        ctx.fillRect(textX - 10, y - mottoSize - 5, maxWidth, mottoSize + 10);
        ctx.strokeRect(textX - 10, y - mottoSize - 5, maxWidth, mottoSize + 10);
    }
    
    ctx.setLineDash([]);
}

function toggleDragMode() {
    dragMode = !dragMode;
    if (dragMode) {
        toggleDragBtn.textContent = 'Disable Drag Mode';
        toggleDragBtn.style.background = 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)';
        toggleDragBtn.style.color = 'var(--primary-blue)';
        canvas.style.cursor = 'move';
    } else {
        toggleDragBtn.textContent = 'Enable Drag Mode';
        toggleDragBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        toggleDragBtn.style.color = 'var(--white)';
        canvas.style.cursor = 'default';
    }
    generateCertificate();
}

function getPhotoBounds() {
    if (!photoImage) return null;
    
    const sizePercent = parseInt(photoSize.value) / 100;
    const photoSize_px = (Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.23) * sizePercent;
    const centerX = CANVAS_WIDTH * parseInt(photoPositionX.value) / 100;
    const centerY = CANVAS_HEIGHT * parseInt(photoPositionY.value) / 100;
    const radius = photoSize_px / 2;
    
    return {
        centerX,
        centerY,
        radius,
        size: photoSize_px
    };
}

function isPointInPhoto(x, y) {
    const bounds = getPhotoBounds();
    if (!bounds) return false;
    
    const distance = Math.sqrt(Math.pow(x - bounds.centerX, 2) + Math.pow(y - bounds.centerY, 2));
    return distance <= bounds.radius;
}

function isPointOnResizeHandle(x, y) {
    const bounds = getPhotoBounds();
    if (!bounds) return false;
    
    // Check if click is on the resize handle (bottom-right corner)
    const handleX = bounds.centerX + bounds.radius * 0.7;
    const handleY = bounds.centerY + bounds.radius * 0.7;
    const handleSize = 15;
    
    return (x >= handleX - handleSize && x <= handleX + handleSize &&
            y >= handleY - handleSize && y <= handleY + handleSize);
}

function handleCanvasMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check for photo resize handle first
    if (photoImage && isPointOnResizeHandle(x, y)) {
        resizingPhoto = true;
        const bounds = getPhotoBounds();
        photoResizeStart.x = x;
        photoResizeStart.y = y;
        photoResizeStart.size = bounds.size;
        canvas.style.cursor = 'nwse-resize';
        return;
    }
    
    // Check for photo drag
    if (photoImage && isPointInPhoto(x, y)) {
        draggingPhoto = true;
        photoDragMode = true;
        const bounds = getPhotoBounds();
        photoDragOffset.x = x - bounds.centerX;
        photoDragOffset.y = y - bounds.centerY;
        canvas.style.cursor = 'move';
        generateCertificate(); // Redraw to show handles
        return;
    }
    
    // Text drag mode (existing functionality)
    if (!dragMode) return;
    
    const textX = CANVAS_WIDTH * parseInt(textPositionX.value) / 100;
    const textY = CANVAS_HEIGHT * parseInt(textPositionY.value) / 100;
    
    // Check if click is near text area
    const nameSize = parseInt(nameFontSize.value);
    const classSize = parseInt(classFontSize.value);
    const schoolSize = parseInt(schoolFontSize.value);
    const mottoSize = parseInt(mottoFontSize.value);
    
    const totalHeight = nameSize + parseInt(nameGap.value) + 
                       classSize + parseInt(classGap.value) + 
                       schoolSize + parseInt(schoolGap.value) + 
                       mottoSize;
    
    if (x >= textX - 50 && x <= textX + 350 && 
        y >= textY - totalHeight && y <= textY + 50) {
        draggingText = true;
        dragOffset.x = x - textX;
        dragOffset.y = y - textY;
    }
}

function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    mousePos.x = x;
    mousePos.y = y;
    
    // Handle photo resizing
    if (resizingPhoto) {
        const bounds = getPhotoBounds();
        const distance = Math.sqrt(Math.pow(x - bounds.centerX, 2) + Math.pow(y - bounds.centerY, 2));
        const newSize = distance * 2;
        const baseSize = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.23;
        const newPercent = Math.max(20, Math.min(400, (newSize / baseSize) * 100));
        
        photoSize.value = Math.round(newPercent);
        photoSizeValue.textContent = Math.round(newPercent) + '%';
        generateCertificate();
        return;
    }
    
    // Handle photo dragging
    if (draggingPhoto && photoImage) {
        const newX = Math.max(0, Math.min(100, (x / CANVAS_WIDTH) * 100));
        const newY = Math.max(0, Math.min(100, (y / CANVAS_HEIGHT) * 100));
        
        photoPositionX.value = Math.round(newX);
        photoPositionXValue.textContent = Math.round(newX) + '%';
        photoPositionY.value = Math.round(newY);
        photoPositionYValue.textContent = Math.round(newY) + '%';
        
        generateCertificate();
        return;
    }
    
    // Update hover state and cursor
    let newHoverPhoto = false;
    if (photoImage) {
        if (isPointOnResizeHandle(x, y)) {
            canvas.style.cursor = 'nwse-resize';
            newHoverPhoto = true;
        } else if (isPointInPhoto(x, y)) {
            canvas.style.cursor = 'move';
            newHoverPhoto = true;
        } else if (dragMode) {
            canvas.style.cursor = 'move';
        } else {
            canvas.style.cursor = 'default';
        }
    } else if (dragMode) {
        canvas.style.cursor = 'move';
    } else {
        canvas.style.cursor = 'default';
    }
    
    // Redraw if hover state changed
    if (newHoverPhoto !== hoverPhoto) {
        hoverPhoto = newHoverPhoto;
        generateCertificate();
    }
    
    // Text drag mode (existing functionality)
    if (!dragMode || !draggingText) return;
    
    const newX = Math.max(0, Math.min(100, ((x - dragOffset.x) / CANVAS_WIDTH) * 100));
    const newY = Math.max(0, Math.min(100, ((y - dragOffset.y) / CANVAS_HEIGHT) * 100));
    
    textPositionX.value = Math.round(newX);
    textPositionXValue.textContent = Math.round(newX) + '%';
    textPositionY.value = Math.round(newY);
    textPositionYValue.textContent = Math.round(newY) + '%';
    
    generateCertificate();
}

function handleCanvasMouseUp(e) {
    draggingText = false;
    draggingPhoto = false;
    resizingPhoto = false;
    photoDragMode = false;
    canvas.style.cursor = 'default';
    if (photoImage) {
        generateCertificate(); // Redraw to update handles
    }
}

function handleCanvasMouseLeave(e) {
    draggingText = false;
    draggingPhoto = false;
    resizingPhoto = false;
    photoDragMode = false;
    hoverPhoto = false;
    canvas.style.cursor = 'default';
    if (photoImage) {
        generateCertificate(); // Redraw to hide handles
    }
}

function drawLogos() {
    const logoSize = CANVAS_WIDTH * 0.067;
    const topMargin = CANVAS_HEIGHT * 0.033;
    const leftStart = CANVAS_WIDTH * 0.1;
    
    // Top logos
    for (let i = 0; i < 3; i++) {
        const x = leftStart + i * (logoSize + CANVAS_WIDTH * 0.017);
        const y = topMargin;
        
        // Circle background
        ctx.beginPath();
        ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#1a365d' : '#0a1929';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Logo text (simplified)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + (logoSize * 0.15) + 'px Arial, sans-serif';
        ctx.textAlign = 'center';
        if (i === 0) {
            ctx.fillText('SPACE', x + logoSize / 2, y + logoSize / 2 - logoSize * 0.06);
            ctx.fillText('COMMUNITY', x + logoSize / 2, y + logoSize / 2 + logoSize * 0.12);
        } else if (i === 1) {
            ctx.fillText('I.M.B.', x + logoSize / 2, y + logoSize / 2);
        } else {
            ctx.fillText('CISE', x + logoSize / 2, y + logoSize / 2);
        }
        ctx.textAlign = 'left';
    }
}

function drawBottomSection() {
    // Wavy bottom edge
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT * 0.85);
    
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
        const waveHeight = Math.sin(i / 30) * 15;
        ctx.lineTo(i, CANVAS_HEIGHT * 0.85 + waveHeight);
    }
    
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT * 0.85);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
    // Global Scholars Olympiad logo (bottom right)
    const logoX = CANVAS_WIDTH * 0.75;
    const logoY = CANVAS_HEIGHT * 0.88;
    const logoRadius = CANVAS_WIDTH * 0.083;
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0a1929';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Graduation cap icon (simplified)
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(logoX - logoRadius * 0.3, logoY - logoRadius * 0.2);
    ctx.lineTo(logoX + logoRadius * 0.3, logoY - logoRadius * 0.2);
    ctx.lineTo(logoX + logoRadius * 0.25, logoY - logoRadius * 0.05);
    ctx.lineTo(logoX - logoRadius * 0.25, logoY - logoRadius * 0.05);
    ctx.closePath();
    ctx.fill();
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold ' + (logoRadius * 0.14) + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GLOBAL', logoX, logoY + logoRadius * 0.15);
    ctx.font = 'bold ' + (logoRadius * 0.16) + 'px Arial, sans-serif';
    ctx.fillText('SCHOLARS OLYMPIAD', logoX, logoY + logoRadius * 0.35);
    ctx.font = 'bold ' + (logoRadius * 0.18) + 'px Arial, sans-serif';
    ctx.fillText('2025', logoX, logoY + logoRadius * 0.6);
    
    // Sponsor logos (bottom left)
    const sponsorY = CANVAS_HEIGHT * 0.92;
    const sponsorX = CANVAS_WIDTH * 0.1;
    
    ctx.textAlign = 'left';
    ctx.font = 'bold ' + (CANVAS_WIDTH * 0.013) + 'px Arial, sans-serif';
    ctx.fillText('RISE UP LABS', sponsorX, sponsorY);
    ctx.fillText('IEEE COMPUTER SOCIETY', sponsorX + CANVAS_WIDTH * 0.125, sponsorY);
    ctx.fillText('ENIGMA TV', sponsorX + CANVAS_WIDTH * 0.29, sponsorY);
    
    // Website URL
    ctx.font = (CANVAS_WIDTH * 0.012) + 'px Arial, sans-serif';
    ctx.fillText('www.globalscholarsolympiad.org', logoX - CANVAS_WIDTH * 0.042, CANVAS_HEIGHT * 0.98);
    ctx.textAlign = 'left';
}

function downloadCertificate() {
    const link = document.createElement('a');
    const name = participantName.value || 'Participant';
    link.download = `GSO_2025_Certificate_${name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function resetForm() {
    // Reset inputs (empty by default)
    participantName.value = '';
    participantClass.value = '';
    schoolName.value = '';
    mottoText.value = '';
    photoSize.value = 100;
    photoSizeValue.textContent = '100%';
    photoPositionX.value = 65;
    photoPositionXValue.textContent = '65%';
    photoPositionY.value = 40;
    photoPositionYValue.textContent = '40%';
    textPositionX.value = 10;
    textPositionXValue.textContent = '10%';
    textPositionY.value = 25;
    textPositionYValue.textContent = '25%';
    
    // Reset font sizes
    nameFontSize.value = 48;
    nameFontSizeValue.textContent = '48px';
    classFontSize.value = 32;
    classFontSizeValue.textContent = '32px';
    schoolFontSize.value = 32;
    schoolFontSizeValue.textContent = '32px';
    mottoFontSize.value = 36;
    mottoFontSizeValue.textContent = '36px';
    
    // Reset colors
    nameColor.value = '#ffffff';
    classColor.value = '#ffffff';
    schoolColor.value = '#ffffff';
    mottoColor.value = '#ffffff';
    
    // Reset gaps
    nameGap.value = 50;
    nameGapValue.textContent = '50px';
    classGap.value = 45;
    classGapValue.textContent = '45px';
    schoolGap.value = 60;
    schoolGapValue.textContent = '60px';
    
    // Reset photo border
    photoBorderEnabled.checked = true;
    photoBorderColor.value = '#d4af37';
    photoBorderWidth.value = 4;
    photoBorderWidthValue.textContent = '4px';
    
    // Reset drag mode
    if (dragMode) {
        toggleDragMode();
    }
    
    // Reset student photo
    uploadedPhoto = null;
    photoImage = null;
    photoPreview.style.display = 'none';
    uploadArea.querySelector('.upload-placeholder').style.display = 'block';
    photoInput.value = '';
    
    // Reset background
    uploadedBackground = null;
    backgroundImage = null;
    backgroundPreview.style.display = 'none';
    backgroundUploadArea.querySelector('.upload-placeholder').style.display = 'block';
    backgroundInput.value = '';
    
    // Reset canvas size
    CANVAS_WIDTH = 1200;
    CANVAS_HEIGHT = 1200;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Regenerate
    generateCertificate();
}

function saveSettings() {
    const settings = {
        // Text values
        participantName: participantName.value,
        participantClass: participantClass.value,
        schoolName: schoolName.value,
        mottoText: mottoText.value,
        
        // Photo settings
        photoSize: photoSize.value,
        photoPositionX: photoPositionX.value,
        photoPositionY: photoPositionY.value,
        
        // Text position
        textPositionX: textPositionX.value,
        textPositionY: textPositionY.value,
        
        // Font sizes
        nameFontSize: nameFontSize.value,
        classFontSize: classFontSize.value,
        schoolFontSize: schoolFontSize.value,
        mottoFontSize: mottoFontSize.value,
        
        // Colors
        nameColor: nameColor.value,
        classColor: classColor.value,
        schoolColor: schoolColor.value,
        mottoColor: mottoColor.value,
        
        // Gaps
        nameGap: nameGap.value,
        classGap: classGap.value,
        schoolGap: schoolGap.value,
        
        // Photo border
        photoBorderEnabled: photoBorderEnabled.checked,
        photoBorderColor: photoBorderColor.value,
        photoBorderWidth: photoBorderWidth.value,
        
        // Drag mode
        dragMode: dragMode,
        
        // Timestamp
        savedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('photoCardSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    } catch (e) {
        alert('Error saving settings: ' + e.message);
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('photoCardSettings');
        if (!saved) {
            alert('No saved settings found.');
            return;
        }
        
        const settings = JSON.parse(saved);
        
        // Load text values
        participantName.value = settings.participantName || '';
        participantClass.value = settings.participantClass || '';
        schoolName.value = settings.schoolName || '';
        mottoText.value = settings.mottoText || '';
        
        // Load photo settings
        if (settings.photoSize) {
            photoSize.value = settings.photoSize;
            photoSizeValue.textContent = settings.photoSize + '%';
        }
        if (settings.photoPositionX) {
            photoPositionX.value = settings.photoPositionX;
            photoPositionXValue.textContent = settings.photoPositionX + '%';
        }
        if (settings.photoPositionY) {
            photoPositionY.value = settings.photoPositionY;
            photoPositionYValue.textContent = settings.photoPositionY + '%';
        }
        
        // Load text position
        if (settings.textPositionX) {
            textPositionX.value = settings.textPositionX;
            textPositionXValue.textContent = settings.textPositionX + '%';
        }
        if (settings.textPositionY) {
            textPositionY.value = settings.textPositionY;
            textPositionYValue.textContent = settings.textPositionY + '%';
        }
        
        // Load font sizes
        if (settings.nameFontSize) {
            nameFontSize.value = settings.nameFontSize;
            nameFontSizeValue.textContent = settings.nameFontSize + 'px';
        }
        if (settings.classFontSize) {
            classFontSize.value = settings.classFontSize;
            classFontSizeValue.textContent = settings.classFontSize + 'px';
        }
        if (settings.schoolFontSize) {
            schoolFontSize.value = settings.schoolFontSize;
            schoolFontSizeValue.textContent = settings.schoolFontSize + 'px';
        }
        if (settings.mottoFontSize) {
            mottoFontSize.value = settings.mottoFontSize;
            mottoFontSizeValue.textContent = settings.mottoFontSize + 'px';
        }
        
        // Load colors
        if (settings.nameColor) nameColor.value = settings.nameColor;
        if (settings.classColor) classColor.value = settings.classColor;
        if (settings.schoolColor) schoolColor.value = settings.schoolColor;
        if (settings.mottoColor) mottoColor.value = settings.mottoColor;
        
        // Load gaps
        if (settings.nameGap) {
            nameGap.value = settings.nameGap;
            nameGapValue.textContent = settings.nameGap + 'px';
        }
        if (settings.classGap) {
            classGap.value = settings.classGap;
            classGapValue.textContent = settings.classGap + 'px';
        }
        if (settings.schoolGap) {
            schoolGap.value = settings.schoolGap;
            schoolGapValue.textContent = settings.schoolGap + 'px';
        }
        
        // Load photo border settings
        if (settings.photoBorderEnabled !== undefined) {
            photoBorderEnabled.checked = settings.photoBorderEnabled;
        }
        if (settings.photoBorderColor) {
            photoBorderColor.value = settings.photoBorderColor;
        }
        if (settings.photoBorderWidth) {
            photoBorderWidth.value = settings.photoBorderWidth;
            photoBorderWidthValue.textContent = settings.photoBorderWidth + 'px';
        }
        
        // Load drag mode
        if (settings.dragMode !== undefined && settings.dragMode !== dragMode) {
            toggleDragMode();
        }
        
        // Update preview
        generateCertificate();
        
        alert('Settings loaded successfully!');
    } catch (e) {
        alert('Error loading settings: ' + e.message);
    }
}

function autoLoadSettings() {
    try {
        const saved = localStorage.getItem('photoCardSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            // Only auto-load if user wants (optional - you can remove this if you don't want auto-load)
            // For now, we'll just show a message that settings are available
            console.log('Saved settings available. Click "Load Settings" to restore them.');
        }
    } catch (e) {
        console.error('Error checking saved settings:', e);
    }
}

function exportSettings() {
    try {
        const saved = localStorage.getItem('photoCardSettings');
        if (!saved) {
            alert('No settings to export. Please save settings first.');
            return;
        }
        
        const settings = JSON.parse(saved);
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `photo-card-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('Settings exported successfully!');
    } catch (e) {
        alert('Error exporting settings: ' + e.message);
    }
}

function importSettings(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const settings = JSON.parse(event.target.result);
            
            // Load all settings (same as loadSettings function)
            participantName.value = settings.participantName || '';
            participantClass.value = settings.participantClass || '';
            schoolName.value = settings.schoolName || '';
            mottoText.value = settings.mottoText || '';
            
            if (settings.photoSize) {
                photoSize.value = settings.photoSize;
                photoSizeValue.textContent = settings.photoSize + '%';
            }
            if (settings.photoPositionX) {
                photoPositionX.value = settings.photoPositionX;
                photoPositionXValue.textContent = settings.photoPositionX + '%';
            }
            if (settings.photoPositionY) {
                photoPositionY.value = settings.photoPositionY;
                photoPositionYValue.textContent = settings.photoPositionY + '%';
            }
            
            if (settings.textPositionX) {
                textPositionX.value = settings.textPositionX;
                textPositionXValue.textContent = settings.textPositionX + '%';
            }
            if (settings.textPositionY) {
                textPositionY.value = settings.textPositionY;
                textPositionYValue.textContent = settings.textPositionY + '%';
            }
            
            if (settings.nameFontSize) {
                nameFontSize.value = settings.nameFontSize;
                nameFontSizeValue.textContent = settings.nameFontSize + 'px';
            }
            if (settings.classFontSize) {
                classFontSize.value = settings.classFontSize;
                classFontSizeValue.textContent = settings.classFontSize + 'px';
            }
            if (settings.schoolFontSize) {
                schoolFontSize.value = settings.schoolFontSize;
                schoolFontSizeValue.textContent = settings.schoolFontSize + 'px';
            }
            if (settings.mottoFontSize) {
                mottoFontSize.value = settings.mottoFontSize;
                mottoFontSizeValue.textContent = settings.mottoFontSize + 'px';
            }
            
            if (settings.nameColor) nameColor.value = settings.nameColor;
            if (settings.classColor) classColor.value = settings.classColor;
            if (settings.schoolColor) schoolColor.value = settings.schoolColor;
            if (settings.mottoColor) mottoColor.value = settings.mottoColor;
            
            if (settings.nameGap) {
                nameGap.value = settings.nameGap;
                nameGapValue.textContent = settings.nameGap + 'px';
            }
            if (settings.classGap) {
                classGap.value = settings.classGap;
                classGapValue.textContent = settings.classGap + 'px';
            }
            if (settings.schoolGap) {
                schoolGap.value = settings.schoolGap;
                schoolGapValue.textContent = settings.schoolGap + 'px';
            }
            
            // Load photo border settings
            if (settings.photoBorderEnabled !== undefined) {
                photoBorderEnabled.checked = settings.photoBorderEnabled;
            }
            if (settings.photoBorderColor) {
                photoBorderColor.value = settings.photoBorderColor;
            }
            if (settings.photoBorderWidth) {
                photoBorderWidth.value = settings.photoBorderWidth;
                photoBorderWidthValue.textContent = settings.photoBorderWidth + 'px';
            }
            
            if (settings.dragMode !== undefined && settings.dragMode !== dragMode) {
                toggleDragMode();
            }
            
            // Also save to localStorage
            localStorage.setItem('photoCardSettings', JSON.stringify(settings));
            
            generateCertificate();
            alert('Settings imported successfully!');
        } catch (e) {
            alert('Error importing settings: ' + e.message);
        }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
}
