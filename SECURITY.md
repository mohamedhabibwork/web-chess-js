# Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of this project seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Private Vulnerability Reporting

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

#### Option 1: GitHub Security Advisories (Recommended)

1. Go to the [Security tab](https://github.com/mohamedhabibwork/web-chess-js/security) in the repository
2. Click on "Report a vulnerability"
3. Fill out the security advisory form with details about the vulnerability
4. Submit the report privately

This method allows us to:
- Review the vulnerability privately
- Work on a fix before public disclosure
- Coordinate disclosure with you
- Credit you for the discovery

#### Option 2: Email (If GitHub is not available)

If you cannot use GitHub Security Advisories, you can email security concerns to the repository maintainer. Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to Include in Your Report

To help us understand and resolve the issue quickly, please include:

1. **Description**: Clear description of the vulnerability
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Impact**: Potential impact of the vulnerability
4. **Affected Versions**: Which versions are affected
5. **Suggested Fix**: If you have ideas for a fix, please share them
6. **Proof of Concept**: If applicable, include a minimal proof of concept

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Security Update Process

1. **Report Received**: We acknowledge receipt within 48 hours
2. **Investigation**: We investigate and verify the vulnerability
3. **Fix Development**: We develop and test a fix
4. **Disclosure**: We coordinate disclosure with the reporter
5. **Release**: We release a security update

### Severity Levels

We use the following severity levels:

- **Critical**: Remote code execution, authentication bypass, or data loss
- **High**: Significant data exposure or privilege escalation
- **Medium**: Limited data exposure or denial of service
- **Low**: Minor information disclosure or best practice violations

### Recognition

We appreciate responsible disclosure and will:

- Credit you in the security advisory (if you wish)
- Acknowledge your contribution in release notes
- Work with you to ensure proper disclosure

### Safe Harbor

We consider security research and vulnerability disclosure activities conducted consistent with this policy to be:

- Authorized in view of any applicable anti-hacking laws
- Exempt from restrictions in our Terms of Service
- Lawful, helpful to the overall security of the Internet, and conducted in good faith

We will not pursue legal action against researchers who:

- Act in good faith
- Do not access or modify data that does not belong to them
- Do not cause harm to our users or systems
- Do not violate any laws

### Best Practices

When reporting vulnerabilities, please:

- Act in good faith
- Respect user privacy
- Do not access or modify data without permission
- Do not perform any actions that could harm users or systems
- Do not publicly disclose the vulnerability until it has been resolved

### Security Updates

Security updates will be released as:

- **Patch versions** (e.g., 1.0.1) for low/medium severity issues
- **Minor versions** (e.g., 1.1.0) for high severity issues
- **Major versions** (e.g., 2.0.0) for critical issues or breaking changes

All security updates will be documented in:
- GitHub Security Advisories
- Release notes
- CHANGELOG.md (if applicable)

## Security Best Practices for Users

When using this project:

1. **Keep Dependencies Updated**: Regularly update dependencies to get security patches
   ```bash
   npm audit
   npm audit fix
   ```

2. **Review Code**: Review code changes before deploying

3. **Use HTTPS**: Always serve the application over HTTPS in production

4. **Environment Variables**: Never commit sensitive data or API keys

5. **Regular Updates**: Keep the project and its dependencies up to date

## Known Security Considerations

### Client-Side Application

This is a client-side chess game application. Security considerations:

- All game logic runs in the browser
- No server-side validation (if used as a standalone app)
- User input is limited to chess moves
- No sensitive data is stored or transmitted

### Dependencies

We regularly audit dependencies for security vulnerabilities:

```bash
npm audit
```

## Contact

For security-related questions or concerns, please use the GitHub Security Advisories feature or contact the repository maintainer.

Thank you for helping keep this project secure!

