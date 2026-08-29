import os from "os";

const checkCPU = () => {
    const cpus = os.cpus();

    const idle = cpus.reduce(
        (sum, cpu) => sum + cpu.times.idle,
        0
    );

    const total = cpus.reduce((sum, cpu) => {
        const times = cpu.times;

        return (
            sum +
            times.user +
            times.nice +
            times.sys +
            times.idle +
            times.irq
        );
    }, 0);

    const usage = 100 - (idle / total) * 100;

    // console.log(`CPU Usage: ${usage.toFixed(2)}%`);

    if (usage >= 70) {
        console.log("CPU usage above 70%. Restarting...");

        process.exit(1);
    }
};

setInterval(checkCPU, 5000);