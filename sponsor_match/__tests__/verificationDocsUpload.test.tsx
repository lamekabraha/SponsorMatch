import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageDropzone from '@/app/Components/DragandDrop';

describe('Upload Verification Docs', () => {
  const createObjectURLMock = jest.fn();

  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: createObjectURLMock,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    createObjectURLMock.mockReturnValue('blob:preview-url');
  });

  it('accepts a PDF certificate via drag and drop and calls onFilesChange', () => {
    const onFilesChange = jest.fn();

    render(
      <ImageDropzone
        multiple={false}
        accept=".jpg,.jpeg,.png,.pdf"
        allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
        onFilesChange={onFilesChange}
      />,
    );

    const dropzone = screen.getByText(/Drag & drop PDF or images/i).closest('div');
    expect(dropzone).toBeInTheDocument();

    const certificate = new File(['pdf-bytes'], 'charity-certificate.pdf', {
      type: 'application/pdf',
    });

    fireEvent.drop(dropzone as Element, {
      dataTransfer: {
        files: [certificate],
      },
    });

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange).toHaveBeenCalledWith([certificate]);
    expect(screen.getByAltText('Document')).toBeInTheDocument();
  });

  it('rejects unsupported files and does not call onFilesChange', () => {
    const onFilesChange = jest.fn();

    render(
      <ImageDropzone
        multiple={false}
        accept=".jpg,.jpeg,.png,.pdf"
        allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
        onFilesChange={onFilesChange}
      />,
    );

    const dropzone = screen.getByText(/Drag & drop PDF or images/i).closest('div');
    const invalidFile = new File(['text'], 'notes.txt', { type: 'text/plain' });

    fireEvent.drop(dropzone as Element, {
      dataTransfer: {
        files: [invalidFile],
      },
    });

    expect(onFilesChange).toHaveBeenCalledWith([]);
    expect(screen.queryByAltText('Document')).not.toBeInTheDocument();
  });
});
