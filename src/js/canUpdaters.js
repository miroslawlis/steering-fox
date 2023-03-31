import dialogCloseHandler from "./modal";

export default function updateTimeCANfromInput(event) {
  const el = document.getElementById("modalTwoInputs");
  const hour = el.querySelector("input.hour.time").value;
  const minutes = el.querySelector("input.minutes.time").value;

  if (
    hour.match(/^[0-9][0-9]$/) != null &&
    minutes.match(/^[0-9][0-9]$/) != null
  ) {
    window.electronAPI.sendMsgToCAN("update-time", hour, minutes);
    dialogCloseHandler(event.target);
  }
}

export function asksCANforNewData() {
  // checks if variable is empty, if soo then ask CAN for new data

  if (!window.CANdata.fuelConsumption1) {
    window.electronAPI.sendMsgToCAN("fuelConsumption1");
  }
  if (!window.CANdata.fuelConsumption2) {
    window.electronAPI.sendMsgToCAN("fuelConsumption2");
  }
  if (!window.CANdata.tempOutside) {
    window.electronAPI.sendMsgToCAN("tempOutside");
  }
  if (!window.CANdata.distance) {
    window.electronAPI.sendMsgToCAN("distance");
  }
  if (!window.CANdata.range) {
    window.electronAPI.sendMsgToCAN("range");
  }
  if (!window.CANdata.avgSpeed) {
    window.electronAPI.sendMsgToCAN("avgSpeed");
  }
  if (!window.CANdata.timeFromInstrumentCluster) {
    window.electronAPI.sendMsgToCAN("time");
  }
}
