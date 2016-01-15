var cf = {
	DEBUG: false,
	ACCOUNT_TEST: {name: 'test', email: 'have.ice@gmail.com', avata: 'data:image/jpeg;base64,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'},
	TOAST_DELAY: 4000,
	SYNC_TABLE : ["Wallet", "TypeSpending", "Spending"],
	LIMIT_SUGGESTION_MONTH : 3,
	SPACE_24 : [199 * 504 / 2835, 240 * 504 / 2835],
	SPACE_36 : [199 * 756 / 2835, 240 * 756 / 2835],
	ICON_LENGTH_X: 13,
	ICON_LENGTH_Y: 12,
	PREF: {wallet: "all", sync: {lastUp: {}, lastDown: {}}},
	MAX_SYNC_TO : 20,
	MAX_SYNC_FROM: 20
};
var db = {
	vi: {
		Wallet: [
			{name: 'Ví tiền', icon: [8, 9], avail: 1, money: 0, symb: 'VND', oder: 1},
			{name: 'ATM', icon: [8, 6], avail: 1, money: 0, symb: 'VND', oder: 2}, 
			{name: 'Tạm để giành', icon: [0, 11], avail: 0, money: 0, symb: 'VND', oder: 3},
			{name: 'Tiền tiết kiệm', icon: [6, 3], avail: 0, money: 0, symb: 'VND', oder: 4}
		],
		TypeOthers: [
			{ oder: 1, name: 'Received from wallet', icon: [9, 11]},
			{ oder: 1, name: 'Transfer to wallet', icon: [6, 10]},
			{ oder: 1, name: 'Add new wallet', icon: [0, 10]},
			{ oder: 1, name: 'Update wallet', icon: [0, 10]}
		],
		TypeEarning: [
			{ oder: 1, name: 'Lương', icon: [9, 2], 
				inner: [
					{ oder: 2, name: 'Thưởng', icon: [7, 9] }
				] 
			},
			{ oder: 3, name: 'Bán hàng', icon: [10, 0] },
			{ oder: 4, name: 'Được cho', icon: [6, 11] },
			{ oder: 5, name: 'Tiền lãi', icon: [7, 11] },
			{ oder: 100, name: 'Khoản thu khác', icon: [1, 4] }
		],
		TypeSpending: [
			{ oder: 1, name: 'Gia đình', icon: [9, 10], 
				inner: [
					{ oder: 2, name: 'Con cái', icon: [10, 6] }
				] 
			},
			{ oder: 3, name: 'Điện & nước & internet', icon: [12, 6] },
			{ oder: 3, name: 'Ăn uống', icon: [1, 0] },
			{ oder: 4, name: 'Bạn bè & người yêu', icon: [0, 0] },
			{ oder: 5, name: 'Du lịch', icon: [11, 0] },
			{ oder: 7, name: 'Giáo dục', icon: [7, 10] },
			{ oder: 8, name: 'Mua sắm', icon: [2, 0] },
			{ oder: 9, name: 'Y tế & Sức khoẻ', icon: [2, 11] },
			{ oder: 10, name: 'Đi lại', icon: [1, 2] },
			{ oder: 10, name: 'Cho vay', icon: [6, 10] },
			{ oder: 100, name: 'Khoản chi phí khác', icon: [1, 4] }
		]
	}, 
	en: {
		Wallet: [
			{name: 'Wallet', icon: [8, 9], avail: 1, money: 0, symb: 'USD', oder: 1},
			{name: 'ATM', icon: [8, 6], avail: 1, money: 0, symb: 'USD', oder: 2}, 
			{name: 'Saving', icon: [6, 3], avail: 0, money: 0, symb: 'USD', oder: 3}
		],
		TypeOthers: [
			{ oder: 1, name: 'Received from wallet', icon: [9, 11]},
			{ oder: 1, name: 'Transfer to wallet', icon: [6, 10]},
			{ oder: 1, name: 'Add new wallet', icon: [0, 10]},
			{ oder: 1, name: 'Update wallet', icon: [0, 10]}
		],
		TypeEarning: [
			{ oder: 1, name: 'Salary', icon: [9, 2], 
				inner: [
					{ oder: 2, name: 'Bonus', icon: [7, 9] }
				] 
			},
			{ oder: 3, name: 'Selling', icon: [10, 0] },
			{ oder: 4, name: 'Gifts', icon: [6, 11] },
			{ oder: 5, name: 'Interest', icon: [7, 11] },
			{ oder: 100, name: 'Other Income', icon: [1, 4] }
		],
		TypeSpending: [
			{ oder: 1, name: 'Family', icon: [9, 10], 
				inner: [
					{ oder: 2, name: 'Children', icon: [10, 6] }
				] 
			},
			{ oder: 3, name: 'Electric - Water - Internet', icon: [12, 6] },
			{ oder: 3, name: 'Food - Beverage', icon: [1, 0] },
			{ oder: 4, name: 'Friend - Love', icon: [0, 0] },
			{ oder: 5, name: 'Travel', icon: [11, 0] },
			{ oder: 7, name: 'Education', icon: [7, 10] },
			{ oder: 8, name: 'Shopping', icon: [2, 0] },
			{ oder: 9, name: 'Health - Fitness', icon: [2, 11] },
			{ oder: 10, name: 'Transportation', icon: [1, 2] },
			{ oder: 10, name: 'Loan', icon: [6, 10] },
			{ oder: 100, name: 'Other Expendse', icon: [1, 4] }
		]
	}
};

var utils = {
	resetDate: function(date, i){
		if(!i){
			date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
  	}else{
  		date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(0);
  	}
  	return date;
	}
};