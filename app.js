document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('pdfFile');
    const statusElement = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');

    if (!fileInput.files.length) {
        showStatus('请选择一个PDF文件', 'error');
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'application/pdf') {
        showStatus('请上传PDF格式的文件', 'error');
        return;
    }

    try {
        showStatus('正在解析PDF文件...', 'success');
        const pdfText = await parsePdf(file);

        showStatus('正在生成Word文档...', 'success');
        const wordBlob = await generateWordDocument(pdfText, file.name);

        showStatus('转换完成！', 'success');
        downloadLink.href = URL.createObjectURL(wordBlob);
        downloadLink.download = `${file.name.replace('.pdf', '.docx')}`;
        downloadLink.style.display = 'inline-block';
    } catch (error) {
        console.error('转换失败:', error);
        showStatus(`转换失败: ${error.message}`, 'error');
    }

    function showStatus(message, type) {
        statusElement.textContent = message;
        statusElement.className = type;
        statusElement.style.display = 'block';
    }

    async function parsePdf(file) {
        const dataBuffer = await file.arrayBuffer();
        const data = await pdfParse(dataBuffer);
        return data.text;
    }

    async function generateWordDocument(text, originalName) {
        const { Document, Packer, Paragraph } = docx;
        const doc = new Document();

        // 将PDF文本分割为段落并添加到文档
        const paragraphs = text.split('\n').filter(line => line.trim() !== '');
        paragraphs.forEach(paragraphText => {
            doc.addSection({ properties: {}, children: [new Paragraph(paragraphText)] });
        });

        const buffer = await Packer.toBlob(doc);
        return buffer;
    }
});