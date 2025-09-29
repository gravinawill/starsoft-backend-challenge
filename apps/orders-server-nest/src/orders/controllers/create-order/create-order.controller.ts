import { Body, Controller, Headers, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'

import { CreateOrderService } from '@/orders/services/create-order.service'
import { ValidationException } from '@/shared/exceptions/business.exception'
import { AppLogger } from '@/shared/logger/logger.service'
import { AuthCustomerService } from '@/users/services/auth-customer.service'
import { ZodValidationPipe } from '@/utils/zod-validation-pipe'

class CreateOrderProductDto {
  @ApiProperty({ example: 'product-uuid-123' })
  id: string

  @ApiProperty({ example: 2 })
  quantity: number
}

class CreateOrderBodyOrderDto {
  @ApiProperty({ type: [CreateOrderProductDto] })
  products: CreateOrderProductDto[]

  @ApiProperty({ enum: ['PIX'], example: 'PIX' })
  paymentMethod: 'PIX'
}

class CreateOrderBodyDto {
  @ApiProperty({ type: CreateOrderBodyOrderDto })
  order: CreateOrderBodyOrderDto
}

class OrderCreatedResponseDto {
  @ApiProperty({ example: 'order-uuid-123' })
  id: string
}

class CreateOrderSuccessResponseDto {
  @ApiProperty({ type: OrderCreatedResponseDto })
  order_created: OrderCreatedResponseDto

  @ApiProperty({ example: 'Order created successfully' })
  message: string
}

class CreateOrderResponseDto {
  @ApiProperty({ type: CreateOrderSuccessResponseDto })
  success: CreateOrderSuccessResponseDto
}

const createOrderBodySchema = z.object({
  order: z.object({
    products: z.array(
      z.object({
        id: z.string(),
        quantity: z.number()
      })
    ),
    paymentMethod: z.string()
  })
})

const bodyValidationPipe = new ZodValidationPipe(createOrderBodySchema)

type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

@ApiTags('orders')
@Controller('/orders')
export class CreateOrderController {
  constructor(
    private createOrderService: CreateOrderService,
    private authCustomerService: AuthCustomerService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(CreateOrderController.name)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateOrderBodyDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: CreateOrderResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable Entity'
  })
  async handle(@Body(bodyValidationPipe) body: CreateOrderBodySchema, @Headers('authorization') authorization: string) {
    const authResult = await this.authCustomerService.authCustomer({
      accessToken: authorization
    })

    if (authResult.isFailure()) {
      this.logger.error({ message: `Authentication failed: ${authResult.value.message}` })
      throw authResult.value
    }

    const { customer } = authResult.value
    this.logger.log({ message: `Authenticated customer: ${customer.id}` })

    const orderResult = await this.createOrderService.createOrder({
      order: {
        customerID: customer.id,
        products: body.order.products.map((product) => ({
          id: product.id,
          quantity: product.quantity
        })),
        paymentMethod: body.order.paymentMethod as never
      }
    })

    if (orderResult.isFailure()) {
      this.logger.error({ message: `Order creation failed: ${orderResult.value.message}` })
      throw new ValidationException(orderResult.value.message)
    }

    const { orderCreated } = orderResult.value
    this.logger.log({ message: `Order created successfully: ${orderCreated.id}` })

    // Return success response
    return {
      success: {
        order_created: {
          id: orderCreated.id
        },
        message: 'Order created successfully'
      }
    }
  }
}
