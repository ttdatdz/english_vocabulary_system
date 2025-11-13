import React, { useEffect, useRef } from "react";
import "./CanvasExamGuide.css";

export default function CanvasExamGuide() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Kích thước mong muốn trên UI (px CSS)
        const displayWidth = 320;
        const displayHeight = 180;

        // Hỗ trợ màn hình retina / hiDPI
        const dpr = window.devicePixelRatio || 1;

        // Set size thực tế của canvas = size hiển thị * dpr
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        // Đảm bảo size hiển thị đúng (tránh CSS làm méo)
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        const ctx = canvas.getContext("2d");

        // Scale để vẽ theo hệ tọa độ 320x180 nhưng nét vẫn sharp
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        let animationFrameId;
        let startTime = null;

        // polyfill roundRect
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
                const radius = typeof r === "number" ? r : 8;
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + w - radius, y);
                this.quadraticCurveTo(x + w, y, x + w, y + radius);
                this.lineTo(x + w, y + h - radius);
                this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
                this.lineTo(x + radius, y + h);
                this.quadraticCurveTo(x, y + h, x, y + h - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
                return this;
            };
        }

        const width = displayWidth;
        const height = displayHeight;

        const drawStepPanel = (x, y, w, h, label, desc, active) => {
            ctx.fillStyle = active ? "#f97316" : "#1f2933";
            ctx.roundRect(x, y, w, h, 8);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x + 16, y + h / 2, 8, 0, Math.PI * 2);
            ctx.fillStyle = active ? "#ffffff" : "#f97316";
            ctx.fill();

            ctx.fillStyle = active ? "#f97316" : "#ffffff";
            ctx.font = "10px system-ui";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, x + 16, y + h / 2);

            ctx.textAlign = "left";
            ctx.font = "11px system-ui";
            ctx.fillStyle = active ? "#ffffff" : "#e5e7eb";
            ctx.fillText(desc, x + 32, y + h / 2 + 1);
        };

        const drawPointer = (x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#facc15";
            ctx.fill();
        };

        const render = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const t = (timestamp - startTime) / 1000;
            const cycle = 9;
            const phase = t % cycle;

            let activeStep = 1;
            if (phase < 3) activeStep = 1;
            else if (phase < 6) activeStep = 2;
            else activeStep = 3;

            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = "#020617";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "#e5e7eb";
            ctx.font = "12px system-ui";
            ctx.textAlign = "left";
            ctx.fillText("Quy trình tạo đề", 16, 22);

            const panelWidth = width - 32;
            const panelHeight = 32;
            const startY = 40;
            const gapY = 10;

            drawStepPanel(
                16,
                startY,
                panelWidth,
                panelHeight,
                "1",
                "Chọn Part cần thêm câu hỏi",
                activeStep === 1
            );
            drawStepPanel(
                16,
                startY + panelHeight + gapY,
                panelWidth,
                panelHeight,
                "2",
                "Thêm câu hỏi từ ngân hàng đề",
                activeStep === 2
            );
            drawStepPanel(
                16,
                startY + (panelHeight + gapY) * 2,
                panelWidth,
                panelHeight,
                "3",
                "Kiểm tra & lưu đề thi",
                activeStep === 3
            );

            let pointerY;
            if (activeStep === 1) pointerY = startY + panelHeight / 2;
            else if (activeStep === 2)
                pointerY = startY + panelHeight + gapY + panelHeight / 2;
            else
                pointerY =
                    startY + (panelHeight + gapY) * 2 + panelHeight / 2;

            const offset = Math.sin((t * Math.PI * 2) / 1.2) * 6;
            drawPointer(width - 40 + offset, pointerY);

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="create-test_teaser-canvas"
        />
    );
}
