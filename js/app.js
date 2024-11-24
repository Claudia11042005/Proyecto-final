document.addEventListener('DOMContentLoaded', function () {
    const fileForm = document.getElementById('fileForm');
    const fileTable = document.getElementById('fileTable');

    // Función para cargar archivos existentes
    async function loadExistingFiles() {
        try {
            const response = await fetch('./list_files.php');
            const files = await response.json();    

            // Limpiar filas existentes
            fileTable.innerHTML = `
                <tr>
                    <th>Archivo</th>
                    <th>Fecha Añadida</th>
                    <th>Opciones</th>
                </tr>
            `;

            files.forEach(file => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${file.name}</td>
                    <td>${file.date}</td>
                    <td>
                        <button class="btn btn-success btn-sm rename-file">Cambiar Nombre</button>
                        <button class="btn btn-info btn-sm download-file">Descargar</button>
                        <button class="btn btn-danger btn-sm delete-file">Eliminar</button>
                    </td>
                `;

                fileTable.appendChild(newRow);

                // Agregar eventos para renombrar, descargar, eliminar
                const renameBtn = newRow.querySelector('.rename-file');
                renameBtn.addEventListener('click', () => renameFile(file.name, newRow));

                const downloadBtn = newRow.querySelector('.download-file');
                downloadBtn.addEventListener('click', () => downloadFile(file.name));

                const deleteBtn = newRow.querySelector('.delete-file');
                deleteBtn.addEventListener('click', () => deleteFile(file.name, newRow));
            });
        } catch (error) {
            console.error('Error al cargar archivos:', error);
        }
    }

    // Cargar archivos existentes al cargar la página
    loadExistingFiles();

    fileForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        if (!file) {
            Swal.fire({
                title: 'Archivo vacío',
                text: 'Por favor, seleccione un archivo antes de subirlo.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        Swal.fire({
            title: 'Subiendo archivo...',
            text: 'Por favor espere.',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false
        });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('./save_task.php', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: 'Archivo subido',
                    text: `El archivo "${file.name}" se ha subido con éxito!`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                // Actualizar lista de archivos
                loadExistingFiles();
                fileInput.value = '';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: `No se pudo subir el archivo: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });

    async function renameFile(fileName, row) {
        const { value: newFileName } = await Swal.fire({
            title: 'Cambiar Nombre',
            input: 'text',
            inputLabel: 'Nuevo nombre del archivo',
            inputValue: fileName,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'El nombre no puede estar vacío!';
                }
            }
        });

        if (newFileName && newFileName !== fileName) {
            try {
                const response = await fetch('./save_task.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'rename', oldName: fileName, newName: newFileName }),
                });

                const result = await response.json();

                if (result.success) {
                    Swal.fire('Renombrado!', `El archivo ahora se llama "${newFileName}".`, 'success');
                    loadExistingFiles(); // Recargar lista de archivos
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                Swal.fire('Error', `No se pudo renombrar el archivo: ${error.message}`, 'error');
            }
        }
    }

    function downloadFile(fileName) {
        const link = document.createElement('a');
        link.href = `uploads/${fileName}`;
        link.download = fileName;
        link.click();
    }

    async function deleteFile(fileName, row) {
        const confirmation = await Swal.fire({
            title: '¿Estás seguro?',
            text: `El archivo "${fileName}" será eliminado permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmation.isConfirmed) {
            try {
                const response = await fetch('./save_task.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'delete', fileName }),
                });

                const result = await response.json();

                if (result.success) {
                    Swal.fire('Eliminado!', `El archivo "${fileName}" ha sido eliminado.`, 'success');
                    loadExistingFiles(); // Recargar lista de archivos
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                Swal.fire('Error', `No se pudo eliminar el archivo: ${error.message}`, 'error');
            }
        }
    }
});