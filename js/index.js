const scaleNormal = 1.2;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdfjs/build/pdf.worker.js';

var pdfDoc = null,
    pageTotal = 1,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = scaleNormal,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

var folderName = document.getElementById('folder');
var totalPages = document.getElementById('total_pages');
var currentPage = document.getElementById('current_page');
var btnProcess = document.getElementById('process')
var pdf = document.getElementById('pdf');

pdf.onchange = function (event) {

    var file = event.target.files[0];
    var url = URL.createObjectURL(file);

    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        totalPages.value = pdfDoc.numPages;
        pageTotal = pdfDoc.numPages;
        btnProcess.disabled = false;
    });

}

btnProcess.addEventListener("click", async function (e) {
    e.preventDefault();

    if (folderName.value.length < 1) {
        message.innerText = "Enter the name of the folder";
        message.setAttribute("class", "error");
        return;
    }

    btnProcess.disabled = true;

    queueRenderPage();

});

async function queueRenderPage() {

    while (pageNum <= pageTotal) {
        await renderPage(pageNum);
        await new Promise(resolve => setTimeout(resolve, 2000));

        var blob = await canvasToBlob();

        await new Promise(resolve => setTimeout(resolve, 1000));

        let formData = new FormData();
        formData.append('foldername', folderName.value);
        formData.append('current_page', pageNum);
        formData.append('extension', "jpeg");
        formData.append("file", blob);

        var savePage = await fetch("savepage.php", {
            method: 'POST',
            body: formData,
        });

        savePage.json().then(data => {

            if(data[0].success) {
                message.innerText = "File save: " + data[0].uploadedFile;
                message.setAttribute("class", "success");
            } else {
                message.innerText = data[0].message;
                message.setAttribute("class", "error");
            }
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        pageNum++;
    }
}

async function renderPage(num) {
    pageRendering = true;
    currentPage.value = num;

    var page = await pdfDoc.getPage(num);

    var viewport = page.getViewport({ scale: scale, });
    
    var outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    var transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : null;

    var renderContext = {
        canvasContext: ctx,
        transform: transform,
        viewport: viewport,
    };
    
    await page.render(renderContext);
    pageRendering = false;
}

async function canvasToBlob() {

    return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
    });
}