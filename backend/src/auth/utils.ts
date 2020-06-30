import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import {createLogger} from "../utils/logger";

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
const logger = createLogger('auth-utils');
export function parseUserId(jwtToken: string): string {
  logger.info('parsing user id');
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}
