import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = '-----BEGIN CERTIFICATE-----\n' +
    'MIIDDTCCAfWgAwIBAgIJdLe9FBGhgSdvMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV\n' +
    'BAMTGWRldi1mcTN0c3M5ZC5ldS5hdXRoMC5jb20wHhcNMjAwNTAxMTc1MzA1WhcN\n' +
    'MzQwMTA4MTc1MzA1WjAkMSIwIAYDVQQDExlkZXYtZnEzdHNzOWQuZXUuYXV0aDAu\n' +
    'Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6dft6CFQotASpvTd\n' +
    'VGg0KuuB2rdbJduYj6Oz4QgLdia0Uz4wXBcizLXpr8rKvNNExD71gSu10Ho83Tze\n' +
    'FcrjV79aJ9lxx2gWazIQYrP3/fFClMGah+cTd5z8FMZPq+sfWxC9WcN9jhhZlEp1\n' +
    'ZBbACCKAFq1ENoxvceRwY1uHAFXzgEu45i4+AE30aJoMHS4VQ0cL5FeBs6xvYd8o\n' +
    'a1bgWhRJVlmH/2+hTkpCka2S4yanfUecBAP8VNznFHCIGWeo2T0NRKDY2Tv7UMhW\n' +
    '9VgU7mqR1fI9OA6mVKCFuVn3m9Ih4hHPxXeX88karokmKHPzGm9CjomzX0yK9g1X\n' +
    '6XVE3wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBT++g8NGy8Y\n' +
    'X/JIB8FgvtY0Psni2jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB\n' +
    'ALUPxtGsPND8CtykesPwSyZPx5WV5bjCKdMr0yTe6PiSBKUI2+lS4qLRNxCDxfq4\n' +
    'u/lckkmhmqm/PIGqovH2231nwrT4pjbk+6Q83/RZ6xJwwGgGrD/8plD6W2yz1JiO\n' +
    'x6C3vzVQjrS/H7/hY7W37gDyeEF965axrQJuoyycwJ2j4DxceiGjdnoDdxdbOgAh\n' +
    'DfFw3Xha9/ShFjfDjabfhoSo8HKcvGiDmU6rM8C6wAysmOp0PovcLkjFXeoOOvVE\n' +
    '9+kHtsNWc/CR3DT+5YTutArdtrF67xM5QLpn6P+EEf4GcuYH6jH4LJZbpzaN9x6s\n' +
    'fH+M9MtgX6iLwShxZzabc9U=\n' +
    '-----END CERTIFICATE-----';

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return undefined
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
