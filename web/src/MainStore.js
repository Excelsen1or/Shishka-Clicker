import {formatNumber} from "./lib/format.js"


export class MainStore {
	static bigNumbers = ["", "K", "M", "B", "T", "QD", "QN", "SX", "SP"]

	static formatShortNumber = (number) => {
		let k = 1000
		let i = 0

		while (number > k) {
			number /= k
			i++
		}

		let sym

		if (i > 8) {
			const zeros = i * 3
			sym = `e${zeros}`
		} else {
			sym = MainStore.bigNumbers[i]
		}

		return `${formatNumber(number)} ${sym}`
	}
}