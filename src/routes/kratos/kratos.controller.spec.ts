import { Test, TestingModule } from '@nestjs/testing';
import { KratosController } from './kratos.controller';

describe('KratosController', () => {
  let controller: KratosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KratosController],
    }).compile();

    controller = module.get<KratosController>(KratosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
