const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeaSchema = new Schema({
	name: { type: String, required: true, },
	description: { type: String, required: true, },
	category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, },
	price: { type: Number, required: true, },
	quantity: { type: Number, required: true, },
});

TeaSchema
	.virtual('url')
	.get(function () {
		return `/catalog/tea/${this._id}`;
	});

module.exports = mongoose.model('Tea', TeaSchema);

