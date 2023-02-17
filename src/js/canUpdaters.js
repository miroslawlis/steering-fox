// import sendCAN from "./ibus";
import dialogCloseHandler from "./modal";

const sendCAN = () => {};

export default function updateTimeCANfromInput(event) {
  const el = document.getElementById("modalTwoInputs");
  const hour = el.querySelector("input.hour.time").value;
  const minutes = el.querySelector("input.minutes.time").value;

  if (
    hour.match(/^[0-9][0-9]$/) != null &&
    minutes.match(/^[0-9][0-9]$/) != null
  ) {
    sendCAN("update-time", hour, minutes);
    dialogCloseHandler(event.target);
  }
}

export function asksCANforNewData() {
  // checks if variable is empty, if soo then ask CAN for new data

  if (!window.CANdata.fuel_consumption_1) {
    sendCAN("window.CANdata.fuel_consumption_1");
  }
  if (!window.CANdata.fuel_consumption_2) {
    sendCAN("window.CANdata.fuel_consumption_2");
  }
  if (!window.CANdata.temp_outside) {
    sendCAN("window.CANdata.temp_outside");
  }
  if (!window.CANdata.distance) {
    sendCAN("window.CANdata.distance");
  }
  if (!window.CANdata.range) {
    sendCAN("window.CANdata.range");
  }
  if (!window.CANdata.avg_speed) {
    sendCAN("window.CANdata.avg_speed");
  }
  if (!window.CANdata.time_instrument_cluster) {
    sendCAN("time");
  }
}
