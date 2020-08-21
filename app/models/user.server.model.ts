'use strict';

/**
 * Module dependencies.
 */
import crypto from 'crypto'
import { prop, pre, ReturnModelType, DocumentType } from '@typegoose/typegoose';
import validator from 'validator';

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (this, property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function (this, password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (this, email) {
	return (this.provider !== 'local' || (email && validator.isEmail(email)));
};

class ProviderData {
	@prop()
	public accessToken?: string;

	@prop()
	public refreshToken?: string;
}

enum Role {
	USER = 'user',
	ADMIN = 'admin'
}

/**
 * Hook a pre save method to hash the password
 */
@pre<User>('save', function (next) {
	if (this.password && this.password.length > 6) {
		this.salt = Buffer.from(crypto.randomBytes(16).toString('base64'), 'base64').toString();
		this.password = this.hashPassword(this.password);
	}

	next();
})
export class User {
	@prop({
		default: '',
		trim: true,
		validate: {
			validator: validateLocalStrategyProperty,
			message: 'Please fill in your first name'
		}
	})
	public firstName?: string;

	@prop({
		default: '',
		trim: true,
		validate: {
			validator: validateLocalStrategyProperty,
			message: 'Please fill in your last name'
		}
	})
	public lastName?: string;

	@prop({ trim: true })
	public displayName?: string;

	@prop({
		default: '',
		trim: true,
		validate: {
			validator: validateLocalStrategyEmail,
			message: 'Please fill in your email'
		}
	})
	public email?: string;

	@prop({ required: true, unique: true, trim: true })
	public username!: string;

	@prop({
		default: '',
		trim: true,
		validate: {
			validator: validateLocalStrategyPassword,
			message: 'Password should be longer'
		}
	})
	public password?: string;

	@prop()
	public salt?: string;

	@prop({ required: true })
	public provider!: string;

	@prop()
	public providerData?: ProviderData;

	@prop()
	public additionalProvidersData?: any;

	@prop({ enum: Role, default: Role.USER })
	public roles?: Role

	@prop()
	public updated?: Date;

	@prop({ default: Date.now })
	public created?: Date;

	@prop()
	public resetPasswordToken?: string;

	@prop()
	public resetPasswordExpires?: string;

	/**
	 * Create instance method for hashing a password
	 */
	public hashPassword(this: DocumentType<User>, password: string) {
		if (this.salt && password) {
			return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha256').toString('base64');
		} else {
			return password;
		}
	}

	/**
	 * Create instance method for authenticating user
	 */
	public authenticate(this: DocumentType<User>, password: string) {
		return this.password === this.hashPassword(password);
	}

	/**
	 * Find possible not used username
	 */
	public static findUniqueUsername(this: ReturnModelType<typeof User>, username: string, suffix: number, callback) {
		var _this = this;
		var possibleUsername = username + (suffix || '');

		_this.findOne({
			username: possibleUsername
		})
			.then(user => {
				if (!user) {
					callback(possibleUsername);
				} else {
					return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
				}
			})
			.catch(err => {
				console.log(err)
				callback(null)
			});
	}
}
