# QR Code Generation Feature Documentation

This document provides an overview of the QR code generation feature within the application, focusing on its functionality, key components, state management, and integration points.

## 1. Overview

The QR code generation feature allows users to create various types of QR codes (URL, Text, Email, Phone, WiFi) with customizable colors, background, and size. The generated QR code can be previewed, downloaded as a PNG image, copied to the clipboard, and its data is sent to an n8n webhook for external processing.

## 2. Key Components

### `src/pages/Generate.tsx`
This is the main component responsible for the QR code generation interface and logic. It manages user inputs, customization options, QR code rendering, and interactions with external services.

### `src/components/QRPreview.tsx`
A sub-component used to display the generated QR code image. It receives the QR data, color, background color, and size as props.

### `src/lib/qr-history.ts`
Contains utility functions for adding generated QR codes to a local history.

## 3. State Management

The `Generate.tsx` component utilizes several `useState` hooks to manage its internal state:

-   **`type`**: (`QRType`) Stores the currently selected QR code type (e.g., "URL", "Text").
-   **`fields`**: (`Record<string, string>`) Stores the input data for the selected QR type (e.g., `url` for "URL" type, `email`, `subject`, `body` for "Email" type).
-   **`color`**: (`string`) Stores the hexadecimal color code for the QR code foreground.
-   **`bgColor`**: (`string`) Stores the hexadecimal color code for the QR code background.
-   **`size`**: (`number`) Stores the size of the QR code in pixels.
-   **`dataUrl`**: (`string`) Stores the data URL of the generated QR code image from the QR server API.
-   **`copied`**: (`boolean`) Indicates if the QR code image has been successfully copied to the clipboard.
-   **`sendingToN8n`**: (`boolean`) Indicates if the QR code data is currently being sent to the n8n webhook. This is used to display a loading indicator.
-   **`showPreview`**: (`boolean`) Controls the visibility of the QR code preview. The preview is only shown when this is `true`.

## 4. Core Functions

### `buildQRData(type: QRType, fields: Record<string, string>): string`
A helper function that constructs the appropriate QR code data string based on the selected `type` and `fields` input. This function handles formatting for different QR types like `mailto:` for Email, `tel:` for Phone, and `WIFI:` for WiFi.

### `handleTypeChange(t: string)`
Updates the `type` state and resets the `fields` state when the user selects a different QR code type.

### `sendQrDataToN8n()`
An asynchronous function responsible for sending the current QR code generation parameters (type, qrData, color, bgColor, size, dataUrl, timestamp) to a predefined n8n webhook URL. It manages the `sendingToN8n` state and provides user feedback via `toast` notifications.

### `handleDownload()`
An asynchronous function triggered when the "Download PNG" button is clicked. It first calls `sendQrDataToN8n()` to send data to the webhook, then initiates the download of the generated QR code image, and finally adds the QR code details to the local history.

### `handleCopy()`
An asynchronous function triggered when the "Copy" button is clicked. It fetches the QR code image as a blob and copies it to the user's clipboard.

## 5. User Interface Interactions

-   **Type Selection Tabs**: Users can select the QR code type using tabs.
-   **Input Fields**: Dynamic input fields appear based on the selected QR type.
-   **Customization Options**: Color pickers and a slider allow users to customize the QR code's appearance and size.
-   **"Generate QR" Button**: When clicked, this button sets `showPreview` to `true` and triggers the `sendQrDataToN8n()` function.
-   **QR Preview Area**: Displays the `QRPreview` component only when `showPreview` is `true`. Otherwise, a placeholder message is shown.
-   **"Download PNG" Button**: Downloads the QR code image and sends data to n8n. Displays a loading spinner while `sendingToN8n` is `true`.
-   **"Copy" Button**: Copies the QR code image to the clipboard.

## 6. Integrations

### n8n Webhook
The `sendQrDataToN8n` function sends a JSON payload containing all relevant QR code generation data to an n8n webhook. This allows for external automation and data collection related to QR code creation events. The current webhook URL is `https://ayush1501.app.n8n.cloud/webhook-test/generateQR`.

### QR Server API
The `qrApiUrl` is constructed to fetch the QR code image from `https://api.qrserver.com/v1/create-qr-code/`. This external API is responsible for rendering the QR code based on the provided data, size, color, and background color parameters.

## 7. Workflow

1.  User selects a QR code `type` and enters `fields` data.
2.  User customizes `color`, `bgColor`, and `size`.
3.  Changes to `type` or `fields` automatically hide the preview (`showPreview` becomes `false`).
4.  User clicks "Generate QR":
    *   `showPreview` is set to `true`.
    *   `sendQrDataToN8n()` is called, sending data to the n8n webhook.
5.  The `QRPreview` component displays the QR code using `qrApiUrl`.
6.  User can click "Download PNG" to download the image (which also triggers `sendQrDataToN8n()`) or "Copy" to copy it to the clipboard.
