
import React from 'react'
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useFilePicker } from 'use-file-picker';

const ImportChooser = ({ showModal, hideModal, confirmModal, id, message }) => {
    const { openFilePicker, filesContent, loading } = useFilePicker({
        accept: '.json',
        multiple: false,
        onFilesSelected: ({ plainFiles, filesContent, errors }) => {
          // this callback is always called, even if there are errors
          console.log('onFilesSelected', plainFiles, filesContent, errors);
        },
        onFilesRejected: ({ errors }) => {
          // this callback is called when there were validation errors
          console.log('onFilesRejected', errors);
        },
        onFilesSuccessfullySelected: ({ plainFiles, filesContent }) => {
          // this callback is called when there were no validation errors
          console.log('onFilesSuccessfullySelected', plainFiles);
          filesContent.map((file, index) => {
            console.log(file.content);
          })
        },
        onClear: () => {
          // this callback is called when the selection is cleared
          console.log('onClear');
        },
    });

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Modal show={showModal} onHide={hideModal}>
            <Button onClick={() => openFilePicker()}>Select a file</Button>
            <br />
            {filesContent.map((file, index) => (
                <div>
                    <h2>{file.name}</h2>
                    <div key={index}>{file.content}</div>
                    <br />
                </div>
            ))}
        </Modal>
    );
};

export default ImportChooser;