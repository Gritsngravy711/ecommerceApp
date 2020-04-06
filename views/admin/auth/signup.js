const layout = require('../layout');

module.exports = ({req}) => {
		return layout ({
			content: `
			<div>
				Your ID is:  ${req.session.userID}
					<form method="POST">
							<input name="email" placeholder="email"/>
							<input name="password" placeholder="password"/>
							<input name="passwordConf" placeholder="confirm password"/>
							<button type="submit">Sign up</button>
					</form>
				</div>
			`
		});
};