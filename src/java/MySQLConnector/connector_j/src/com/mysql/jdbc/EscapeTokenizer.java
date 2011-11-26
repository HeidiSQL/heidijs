/*
 Copyright (c) 2002, 2010, Oracle and/or its affiliates. All rights reserved.
 

  The MySQL Connector/J is licensed under the terms of the GPLv2
  <http://www.gnu.org/licenses/old-licenses/gpl-2.0.html>, like most MySQL Connectors.
  There are special exceptions to the terms and conditions of the GPLv2 as it is applied to
  this software, see the FLOSS License Exception
  <http://www.mysql.com/about/legal/licensing/foss-exception.html>.

  This program is free software; you can redistribute it and/or modify it under the terms
  of the GNU General Public License as published by the Free Software Foundation; version 2
  of the License.

  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with this
  program; if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth
  Floor, Boston, MA 02110-1301  USA



 */
package com.mysql.jdbc;

/**
 * EscapeTokenizer breaks up an SQL statement into SQL and escape code parts.
 * 
 * @author Mark Matthews
 */
public class EscapeTokenizer {
	// ~ Instance fields
	// --------------------------------------------------------

	private int bracesLevel = 0;

	private boolean emittingEscapeCode = false;

	private boolean inComment = false;

	private boolean inQuotes = false;

	private char lastChar = 0;

	private char lastLastChar = 0;

	private int pos = 0;

	private char quoteChar = 0;

	private boolean sawVariableUse = false;

	private String source = null;

	private int sourceLength = 0;

	// ~ Constructors
	// -----------------------------------------------------------

	/**
	 * Creates a new EscapeTokenizer object.
	 * 
	 * @param s
	 *            the string to tokenize
	 */
	public EscapeTokenizer(String s) {
		this.source = s;
		this.sourceLength = s.length();
		this.pos = 0;
	}

	// ~ Methods
	// ----------------------------------------------------------------

	/**
	 * Does this tokenizer have more tokens available?
	 * 
	 * @return if this tokenizer has more tokens available
	 */
	public synchronized boolean hasMoreTokens() {
		return (this.pos < this.sourceLength);
	}

	/**
	 * Returns the next token
	 * 
	 * @return the next token.
	 */
	public synchronized String nextToken() {
		StringBuffer tokenBuf = new StringBuffer();

		if (this.emittingEscapeCode) {
			tokenBuf.append("{"); //$NON-NLS-1$
			this.emittingEscapeCode = false;
		}

		for (; this.pos < this.sourceLength; this.pos++) {
			char c = this.source.charAt(this.pos);

			// Detect variable usage

			if (!this.inQuotes && c == '@') {
				this.sawVariableUse = true;
			}

			if ((c == '\'' || c == '"') && !inComment) {
				if (this.inQuotes && c == quoteChar) {
					if (this.pos + 1 < this.sourceLength) {
						if (this.source.charAt(this.pos + 1) == quoteChar) {
							// Doubled-up quote escape, if the first quote isn't already escaped
							if (this.lastChar != '\\') {
								tokenBuf.append(quoteChar);
								tokenBuf.append(quoteChar);
								this.pos++;
								continue;
							}
						}
					}
				}
				if (this.lastChar != '\\') {
					if (this.inQuotes) {
						if (this.quoteChar == c) {
							this.inQuotes = false;
						}
					} else {
						this.inQuotes = true;
						this.quoteChar = c;
					}
				} else if (this.lastLastChar == '\\') {
					if (this.inQuotes) {
						if (this.quoteChar == c) {
							this.inQuotes = false;
						}
					} else {
						this.inQuotes = true;
						this.quoteChar = c;
					}
				}

				tokenBuf.append(c);
			} else if (c == '-') {
				if ((this.lastChar == '-')
						&& ((this.lastLastChar != '\\') && !this.inQuotes)) {
					this.inComment = true;
				}

				tokenBuf.append(c);
			} else if ((c == '\n') || (c == '\r')) {
				this.inComment = false;

				tokenBuf.append(c);
			} else if (c == '{') {
				if (this.inQuotes || this.inComment) {
					tokenBuf.append(c);
				} else {
					this.bracesLevel++;

					if (this.bracesLevel == 1) {
						this.pos++;
						this.emittingEscapeCode = true;

						return tokenBuf.toString();
					}

					tokenBuf.append(c);
				}
			} else if (c == '}') {
				tokenBuf.append(c);

				if (!this.inQuotes && !this.inComment) {
					this.lastChar = c;

					this.bracesLevel--;

					if (this.bracesLevel == 0) {
						this.pos++;

						return tokenBuf.toString();
					}
				}
			} else {
				tokenBuf.append(c);
			}

			this.lastLastChar = this.lastChar;
			this.lastChar = c;
		}

		return tokenBuf.toString();
	}

	boolean sawVariableUse() {
		return this.sawVariableUse;
	}
}
